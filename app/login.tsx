import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GetCurrentLoginApi, LoginUserApi } from '@/services/user.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    setError('');

    try {
      // Đăng nhập
      const loginResponse = await LoginUserApi({ username, password });


      if (loginResponse.status === 200) {
        // Lưu access_token
        await AsyncStorage.setItem('access_token', loginResponse.data.access_token);

        // Gọi API GetCurrentLoginApi để lấy thông tin người dùng
        const userResponse = await GetCurrentLoginApi();
        console.log('get current login response:', userResponse);

        if (userResponse.status === 200) {
          const { id, role } = userResponse.data;
          // Lưu id và role vào AsyncStorage
          await AsyncStorage.setItem('user_id', id);
          await AsyncStorage.setItem('user_role', role);
          console.log('Stored user_id:', id, 'user_role:', role);

          // Kiểm tra role và điều hướng
          if (role === 'admin') {
            router.push('/admin/admin'); // Trang admin
          } else {
            router.push('/(tabs)'); // Trang người dùng thông thường
          }
        } else {
          throw new Error(userResponse.data.message || 'Không thể lấy thông tin người dùng.');
        }
      } else {
        setError(loginResponse.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Đăng nhập thất bại';
      setError(errorMessage);
      console.error('Login error:', error);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Đăng nhập
      </ThemedText>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="Tên đăng nhập hoặc Email"
        placeholderTextColor={iconColor}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading} // Disable input during loading
      />
      <TextInput
        style={[styles.input, { borderColor: iconColor, color: textColor }]}
        placeholder="Mật khẩu"
        placeholderTextColor={iconColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading} // Disable input during loading
      />

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: buttonBackground,
            opacity: isLoading ? 0.6 : 1, // Dim button when loading
          },
        ]}
        onPress={handleLogin}
        disabled={isLoading} // Disable button when loading
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => router.push('/signup')}
        disabled={isLoading} // Disable signup link during loading
      >
        <ThemedText style={[styles.signupText, { color: buttonBackground }]}>
          Chưa có tài khoản? Đăng ký
        </ThemedText>
      </TouchableOpacity>
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
  signupLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Login;