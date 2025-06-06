import { CreateChatSessionApi, SendMessageApi } from '@/services/allmodelservices';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definitions
interface Message {
  prompt: string;
  response?: string;
  imageUrls?: string[];
  isLoading?: boolean;
}

interface TheHiveImageProps {
  package_id: string;
  first_supported_feature: string;
  ai_model: string;
}

const TheHiveImage: React.FC<TheHiveImageProps> = ({
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

  // Create session
  const createSession = useCallback(async (): Promise<string> => {
    const response = await CreateChatSessionApi({
      package_id,
      title: 'Gemini Chat Session',
    });
    const sessionId = response.data.session_id;
    setChatSessionId(sessionId);
    return sessionId;
  }, [package_id]);

  // Send text message
  const sendMessage = useCallback(
    async () => {
      if (!prompt.trim()) return;

      const newMessage: Message = { prompt, isLoading: true };
      setMessages((prev) => [...prev, newMessage]);
      setPrompt('');
      setError(null);
      Keyboard.dismiss();

      try {
        const sessionId = chatSessionId || (await createSession());
        const response = await SendMessageApi(sessionId, {
          prompt,
          message_type: first_supported_feature,
          ai_source: ai_model,
        });

        let textResponse = response.data.response || 'No response received';
        let imageUrls: string[] | undefined;

        // Try to parse response as JSON to check for image URLs
        try {
          const parsed = JSON.parse(response.data.response);
          if (Array.isArray(parsed) && parsed.every((url) => typeof url === 'string')) {
            imageUrls = parsed;
            textResponse = ''; // Clear text response if images are found
          }
        } catch {
          // Not a JSON array, treat as text
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[prev.length - 1] = {
            ...updated[prev.length - 1],
            response: textResponse || undefined,
            imageUrls,
            isLoading: false,
          };
          return updated;
        });
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to send message';
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
    },
    [prompt, chatSessionId, createSession, first_supported_feature, ai_model]
  );

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setMessages((prev) => [
        { prompt: 'Older message', response: 'Older response' },
        { prompt: 'Another old message', response: 'Older response' },
        ...prev,
      ]);
      setRefreshing(false);
    }, 1000);
  }, []);

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
      </View>
      <View style={[styles.bubble, styles.aiBubble]}>
        {msg.isLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : msg.imageUrls?.length ? (
          msg.imageUrls.map((url, idx) => (
            <Image key={idx} source={{ uri: url }} style={styles.image} />
          ))
        ) : (
          <Text style={styles.responseText}>{msg.response || 'No response'}</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
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
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, !prompt.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!prompt.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  errorText: { color: '#D32F2F', padding: 8, textAlign: 'center', fontSize: 14 },
  messageContainer: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 20 },
  message: { marginBottom: 12 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginVertical: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  promptText: { color: '#FFF', fontSize: 16 },
  responseText: { color: '#000', fontSize: 16 },
  image: { width: 200, height: 200, borderRadius: 8, marginVertical: 8 },
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

export default TheHiveImage;