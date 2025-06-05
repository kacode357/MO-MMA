import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface Message {
  type: 'user' | 'bot';
  content: string; // Prompt hoặc URL hình ảnh
}

const HiveModel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Fetch theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const buttonBackground = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  // Yêu cầu quyền truy cập thư viện ảnh
  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Tải hình ảnh về máy
  const downloadImage = async (imageUrl: string) => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Lỗi', 'Không có quyền truy cập thư viện ảnh. Vui lòng cấp quyền để tải hình ảnh.');
      return;
    }

    try {
      // Tải hình ảnh từ URL về thư mục tạm
      const fileName = `HiveModel_${Date.now()}.jpeg`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status === 200) {
        // Lưu hình ảnh vào thư viện ảnh
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync('HiveModel', asset, false);
        Alert.alert('Thành công', 'Hình ảnh đã được lưu vào thư viện ảnh trong album HiveModel.');
      } else {
        throw new Error('Không thể tải hình ảnh.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Lỗi không xác định';
      Alert.alert('Lỗi', `Không thể tải hình ảnh: ${errorMessage}`);
    }
  };

  // API call to generate images
  const generateImages = async (userPrompt: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.thehive.ai/api/v3/stabilityai/sdxl',
        {
          input: {
            prompt: userPrompt,
            negative_prompt: 'blurry',
            image_size: { width: 1024, height: 1024 },
            num_inference_steps: 15,
            guidance_scale: 3.5,
            num_images: 2,
            seed: 67,
            output_format: 'jpeg',
            output_quality: 90,
          },
        },
        {
          headers: {
            'Authorization': 'Bearer yNVUdjuAPVFR5mlU5T5UQg==',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.output && response.data.output.length >= 2) {
        const imageUrls = response.data.output.map((item: { url: string }) => item.url);
        // Thêm prompt của người dùng vào danh sách tin nhắn
        setMessages((prev) => [...prev, { type: 'user', content: userPrompt }]);
        // Thêm 2 hình ảnh vào danh sách tin nhắn
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: imageUrls[0] },
          { type: 'bot', content: imageUrls[1] },
        ]);
      } else {
        throw new Error('Không thể tạo hình ảnh.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
      setPrompt(''); // Xóa prompt sau khi gửi
    }
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả hình ảnh.');
      return;
    }
    generateImages(prompt);
  };

  const handleLongPressImage = (imageUrl: string) => {
    Alert.alert(
      'Tải hình ảnh',
      'Bạn có muốn tải hình ảnh này về máy không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tải xuống',
          onPress: () => downloadImage(imageUrl),
        },
      ],
      { cancelable: true }
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    return (
      <ThemedView
        style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? buttonBackground : '#2a2a32',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {item.type === 'user' ? (
          <ThemedText style={[styles.messageText, { color: '#FFFFFF' }]}>
            {item.content}
          </ThemedText>
        ) : (
          <TouchableOpacity onLongPress={() => handleLongPressImage(item.content)}>
            <Image
              source={{ uri: item.content }}
              style={styles.messageImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </ThemedView>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 80}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Danh sách tin nhắn */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Ô nhập prompt và nút gửi */}
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: iconColor }]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Nhập mô tả hình ảnh..."
            placeholderTextColor={iconColor}
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: buttonBackground, opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleSendPrompt}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>Gửi</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messageList: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HiveModel;