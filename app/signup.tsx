import NotificationModal from '@/components/NotificationModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CreateUserApi } from '@/services/user.services';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [full_name, setFullName] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setError('Vui Lòng Nhập Đầy Đủ Thông Tin');
      return;
    }
    if (!email.includes('@')) {
      setError('Email Không Hợp Lệ');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError('');

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
        setSuccessMessage('Đăng Ký Thành Công, Vui Lòng Đăng Nhập');
        setModalVisible(true);
        setError('');
      } else {
        setError(response.data.message || 'Đăng Ký Thất Bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Đăng Ký Thất Bại';
      setError(errorMessage);
      console.error('signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setModalVisible(false);
    router.push('/login');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Logo */}
      <Image
        source={require('../assets/images/lgo-5.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Form Container */}
      <ThemedView style={styles.formContainer}>
        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}

        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder="Họ Và Tên"
          placeholderTextColor={iconColor}
          value={full_name}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder="Tên Đăng Nhập"
          placeholderTextColor={iconColor}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder="Email"
          placeholderTextColor={iconColor}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder="Mật Khẩu"
          placeholderTextColor={iconColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonBackground,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Đang Đăng Ký...' : 'Đăng Ký'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Login Link */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push('/login')}
        disabled={isLoading}
      >
        <ThemedText style={[styles.loginText, { color: buttonBackground }]}>
          Đã Có Tài Khoản? Đăng Nhập
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
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
    fontSize: 14,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Signup;