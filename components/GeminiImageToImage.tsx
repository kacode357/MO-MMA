import { CreateChatSessionApi, SendImageMessageApi } from '@/services/allmodelservices';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definitions
interface ImageData {
  mimeType: string;
  data: string;
}

interface ImageMessage {
  prompt: string;
  inputImage?: ImageData;
  images?: ImageData[];
  text?: string;
  isLoading?: boolean;
}

interface GeminiImageToImageProps {
  package_id: string;
  first_supported_feature: string;
  ai_model: string;
}

const GeminiImageToImage: React.FC<GeminiImageToImageProps> = ({
  package_id,
  first_supported_feature,
  ai_model,
}) => {
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ImageMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library was denied');
      }
    })();
  }, []);

  // Create session
  const createSession = useCallback(async (): Promise<string> => {
    try {
      const response = await CreateChatSessionApi({
        package_id,
        title: 'Gemini Image-to-Image Session',
      });
      const sessionId = response.data.session_id;
      setChatSessionId(sessionId);
      return sessionId;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create session';
      setError(errorMessage);
      throw err;
    }
  }, [package_id]);

  // Pick image
  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].base64) {
        const mimeType = result.assets[0].mimeType || 'image/jpeg';
        setSelectedImage({
          mimeType,
          data: result.assets[0].base64,
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to pick image');
    }
  }, []);

  // Send image generation request
  const sendImageRequest = useCallback(async () => {
    if (!prompt.trim() || !selectedImage) {
      setError('Please provide a prompt and select an image');
      return;
    }

    const newMessage: ImageMessage = {
      prompt,
      inputImage: selectedImage,
      isLoading: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setPrompt('');
    setSelectedImage(null);
    setError(null);
    Keyboard.dismiss();

    try {
      const sessionId = chatSessionId || (await createSession());
      const response = await SendImageMessageApi(sessionId, {
        prompt,
        message_type: first_supported_feature,
        ai_source: ai_model,
        input_image: selectedImage,
      });

      let images: ImageData[] = [];
      let text: string | undefined;
      try {
        const parsed = JSON.parse(response.data.response);
        if (parsed.images && Array.isArray(parsed.images)) {
          images = parsed.images.filter(
            (img: any) => typeof img.mimeType === 'string' && typeof img.data === 'string'
          );
        }
        if (typeof parsed.text === 'string') {
          text = parsed.text.trim();
        }
      } catch {
        throw new Error('Failed to parse response data');
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[prev.length - 1] = {
          ...updated[prev.length - 1],
          images: images.length ? images : undefined,
          text,
          isLoading: false,
        };
        return updated;
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate response';
      setError(errorMessage);
      setMessages((prev) => {
        const updated = [...prev];
        updated[prev.length - 1] = {
          ...updated[prev.length - 1],
          isLoading: false,
        };
        return updated;
      });
    }
  }, [prompt, selectedImage, chatSessionId, createSession, first_supported_feature, ai_model]);

  // Auto-scroll and keyboard handling
  useEffect(() => {
    const scrollToBottom = () => scrollViewRef.current?.scrollToEnd({ animated: true });
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      scrollToBottom();
      textInputRef.current?.focus();
    });

    scrollToBottom();
    return () => keyboardDidShow.remove();
  }, [messages]);

  // Render messages
  const renderedMessages = messages.map((msg, index) => (
    <View key={index} style={styles.message}>
      <View style={[styles.bubble, styles.userBubble]}>
        <Text style={styles.promptText}>{msg.prompt}</Text>
        {msg.inputImage && (
          <Image
            source={{ uri: `data:${msg.inputImage.mimeType};base64,${msg.inputImage.data}` }}
            style={styles.image}
          />
        )}
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        {msg.isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            {msg.images?.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: `data:${img.mimeType};base64,${img.data}` }}
                style={styles.image}
              />
            ))}
            {msg.text && <Text style={styles.responseText}>{msg.text}</Text>}
            {!msg.images?.length && !msg.text && (
              <Text style={styles.errorText}>No images or text generated</Text>
            )}
          </>
        )}
      </View>
    </View>
  ));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
      enabled
    >
      {error && <Text style={styles.errorText}>{error}</Text>}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderedMessages}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type your prompt..."
          multiline
          returnKeyType="send"
          onSubmitEditing={sendImageRequest}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!prompt.trim() || !selectedImage) && styles.sendButtonDisabled]}
          onPress={sendImageRequest}
          disabled={!prompt.trim() || !selectedImage}
        >
          <Text style={styles.sendButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  errorText: { color: '#D32F2F', padding: 8, textAlign: 'center', fontSize: 14 },
  responseText: { color: '#000', fontSize: 16, marginVertical: 8 },
  messageContainer: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 20 },
  message: { marginBottom: 12 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginVertical: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  promptText: { color: '#FFF', fontSize: 16, marginBottom: 8 },
  image: { width: 200, height: 200, borderRadius: 8, marginVertical: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageButton: { padding: 10, marginRight: 8 },
  imageButtonText: { fontSize: 24 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 8,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    minHeight: 40,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  sendButtonDisabled: { backgroundColor: '#A0A0A0' },
  sendButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});

export default GeminiImageToImage;