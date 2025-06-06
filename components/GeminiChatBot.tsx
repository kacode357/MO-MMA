import { CreateChatSessionApi, SendMessageApi } from '@/services/allmodelservices';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Type definitions
interface Message {
  prompt: string;
  response?: string;
  isLoading?: boolean;
}

interface GeminiChatBotProps {
  package_id: string;
  first_supported_feature: string;
  ai_model: string;
}

const GeminiChatBot: React.FC<GeminiChatBotProps> = ({
  package_id,
  first_supported_feature,
  ai_model,
}) => {
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Memoized create session function
  const createSession = useCallback(async (): Promise<string> => {
    try {
      const response = await CreateChatSessionApi({
        package_id,
        title: 'Gemini Chat Session',
      });
      const sessionId = response.data.session_id;
      setChatSessionId(sessionId);
      return sessionId;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create chat session';
      setError(errorMessage);
      throw err;
    }
  }, [package_id]);

  // Memoized send message handler
  const handleSendMessage = useCallback(async () => {
    if (!prompt.trim()) return;

    const newMessage: Message = { prompt, isLoading: true };
    setMessages((prev) => [...prev, newMessage]);
    setPrompt('');
    setError(null);

    try {
      const sessionId = chatSessionId || (await createSession());
      const response = await SendMessageApi(sessionId, {
        prompt,
        message_type: first_supported_feature,
        ai_source: ai_model,
      });

      const aiResponse = response.data.response || 'No response received';
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, response: aiResponse, isLoading: false } : msg
        )
      );
      Keyboard.dismiss();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send message';
      setError(errorMessage);
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, isLoading: false } : msg
        )
      );
    }
  }, [prompt, chatSessionId, createSession, first_supported_feature, ai_model]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching older messages (replace with real API if available)
    setTimeout(() => {
      const olderMessages: Message[] = [
        { prompt: 'Older message', response: 'Older response' },
        { prompt: 'Another old message', response: 'Another old response' },
      ];
      setMessages((prev) => [...olderMessages, ...prev]);
      setRefreshing(false);
    }, 1000);
  }, []);

  // Scroll to bottom when messages change or keyboard shows
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      textInputRef.current?.focus();
    });

    scrollViewRef.current?.scrollToEnd({ animated: true });

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [messages]);

  // Handle input submission on keyboard return
  const handleSubmitEditing = useCallback(() => {
    handleSendMessage();
  }, [handleSendMessage]);

  // Memoized message list to optimize rendering
  const renderedMessages = useMemo(() => {
    return messages.map((msg, index) => (
      <View key={index} style={styles.message}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.promptText}>{msg.prompt}</Text>
        </View>
        <View style={[styles.bubble, styles.aiBubble]}>
          {msg.isLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.responseText}>{msg.response || 'No response'}</Text>
          )}
        </View>
      </View>
    ));
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.select({
        ios: 100,
        android: 80,
      })}
      enabled
    >
      {error && <Text style={styles.errorText}>{error}</Text>}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        {renderedMessages}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type your message..."
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, !prompt.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!prompt.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#D32F2F',
    padding: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  messageContainer: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 20,
  },
  message: {
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptText: {
    color: '#FFF',
    fontSize: 16,
  },
  responseText: {
    color: '#000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    minHeight: 40,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GeminiChatBot;