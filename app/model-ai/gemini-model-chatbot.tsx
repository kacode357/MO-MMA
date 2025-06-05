import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface MessagePart {
  text: string;
  isBold: boolean;
}

interface Message {
  type: 'user' | 'bot' | 'typing';
  content: string | MessagePart[]; // Prompt hoặc câu trả lời từ Gemini (có thể chứa các phần in đậm)
  fullContent?: string; // Lưu trữ nội dung đầy đủ để dùng cho hiệu ứng gõ
}

const GeminiModelChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Fetch theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const buttonBackground = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  // API call to Gemini
  const sendMessageToGemini = async (userPrompt: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyADLXdLtdYq8BdT8GFMDAd2Llc1a7Ef1cw',
        {
          contents: [
            {
              parts: [
                {
                  text: userPrompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.candidates && response.data.candidates.length > 0) {
        const botResponse = response.data.candidates[0].content.parts[0].text;
        // Thêm prompt của người dùng vào danh sách tin nhắn
        setMessages((prev) => [...prev, { type: 'user', content: userPrompt }]);
        // Thêm chỉ báo "Đang trả lời..." trước khi bắt đầu hiệu ứng gõ
        setMessages((prev) => [...prev, { type: 'typing', content: 'Đang trả lời...' }]);
        // Bắt đầu hiệu ứng gõ từ từ
        startTypingEffect(botResponse);
      } else {
        throw new Error('Không thể nhận câu trả lời từ Gemini.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Lỗi không xác định';
      Alert.alert('Lỗi', errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.type !== 'typing')); // Xóa chỉ báo "Đang trả lời..." nếu có lỗi
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  // Xử lý định dạng dấu * để in đậm
  const parseFormattedText = (text: string): MessagePart[] => {
    const parts: MessagePart[] = [];
    const regex = /(\*[^*]+\*)/g;
    let lastIndex = 0;

    text.replace(regex, (match, p1, offset) => {
      // Thêm phần text trước đoạn in đậm (nếu có)
      if (offset > lastIndex) {
        parts.push({ text: text.slice(lastIndex, offset), isBold: false });
      }
      // Thêm phần in đậm (bỏ dấu * ở đầu và cuối)
      parts.push({ text: match.slice(1, -1), isBold: true });
      lastIndex = offset + match.length;
      return match;
    });

    // Thêm phần text còn lại sau đoạn in đậm cuối cùng (nếu có)
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isBold: false });
    }

    return parts;
  };

  // Hiệu ứng gõ từ từ
  const startTypingEffect = (fullResponse: string) => {
    const parts = parseFormattedText(fullResponse);
    let currentText = '';
    let currentIndex = 0;
    let currentPartIndex = 0;
    const displayedParts: MessagePart[] = [];

    const interval = setInterval(() => {
      if (currentPartIndex >= parts.length) {
        clearInterval(interval);
        // Xóa chỉ báo "Đang trả lời..." và hiển thị tin nhắn hoàn chỉnh
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => msg.type !== 'typing');
          return [...updatedMessages, { type: 'bot', content: parts }];
        });
        return;
      }

      const currentPart = parts[currentPartIndex];
      if (currentIndex < currentPart.text.length) {
        currentText += currentPart.text[currentIndex];
        currentIndex++;
      } else {
        displayedParts.push({ text: currentText, isBold: currentPart.isBold });
        currentText = '';
        currentIndex = 0;
        currentPartIndex++;
      }

      // Cập nhật tin nhắn "Đang trả lời..." với nội dung đang gõ
      setMessages((prev) => {
        const updatedMessages = prev.filter((msg) => msg.type !== 'typing');
        return [...updatedMessages, { type: 'typing', content: 'Đang trả lời...', fullContent: currentText }];
      });
    }, 50); // Tốc độ gõ: 50ms mỗi ký tự
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi.');
      return;
    }
    sendMessageToGemini(prompt);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    const isTyping = item.type === 'typing';

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
        {isTyping ? (
          <ThemedView style={styles.typingContainer}>
            <ThemedText style={[styles.messageText, { color: '#000000' }]}>
              Đang trả lời...
            </ThemedText>
            <ActivityIndicator size="small" color="#000000" style={styles.typingIndicator} />
          </ThemedView>
        ) : typeof item.content === 'string' ? (
          <ThemedText style={[styles.messageText, { color: '#000000' }]}>
            {item.content}
          </ThemedText>
        ) : (
          <ThemedView style={styles.formattedTextContainer}>
            {item.content.map((part, index) => (
              <ThemedText
                key={index}
                style={[
                  styles.messageText,
                  { color: '#000000', fontWeight: part.isBold ? 'bold' : 'normal' },
                ]}
              >
                {part.text}
              </ThemedText>
            ))}
          </ThemedView>
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
            placeholder="Nhập câu hỏi..."
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
  formattedTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIndicator: {
    marginLeft: 8,
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

export default GeminiModelChatbot;