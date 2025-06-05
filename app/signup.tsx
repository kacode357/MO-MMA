import NotificationModal from '@/components/NotificationModal'; // Adjust path as needed
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CreateUserApi } from '@/services/user.services';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const buttonBackground = useThemeColor(
    {
      light: '#007AFF',
      dark: '#0A84FF',
      red: '#FF0000',
    },
    'tint'
  );

  const handleSignup = async () => {
    if (!username || !email || !password || !full_name) {
      setError('vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!email.includes('@')) {
      setError('email không hợp lệ');
      return;
    }

    try {
      const userData = {
        full_name,
        username,
        password,
        email,
      };
      const response = await CreateUserApi(userData);
      console.log('signup response:', response);

      if (response.status === 201) {
        setSuccessMessage('Đăng ký thành công, vui lòng đăng nhập');
        setModalVisible(true);
        setError('');
      } else {
        router.push('/(tabs)/user');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'đăng ký thất bại';
      setError(errorMessage);
      console.error('signup error:', error);
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    router.push('/login');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        đăng ký
      </ThemedText>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="họ và tên"
        placeholderTextColor={iconColor}
        value={full_name}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="tên đăng nhập"
        placeholderTextColor={iconColor}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="email"
        placeholderTextColor={iconColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="mật khẩu"
        placeholderTextColor={iconColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackground }]}
        onPress={handleSignup}
      >
        <ThemedText style={styles.buttonText}>đăng ký</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push('/login')}
      >
        <ThemedText style={[styles.loginText, { color: buttonBackground }]}>
          đã có tài khoản? đăng nhập
        </ThemedText>
      </TouchableOpacity>

      <NotificationModal
        visible={modalVisible}
        message={successMessage}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Signup;