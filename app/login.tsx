import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GetCurrentLoginApi, LoginUserApi } from '@/services/user.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const loginResponse = await LoginUserApi({ username, password });

      if (loginResponse.status === 200) {
        await AsyncStorage.setItem('access_token', loginResponse.data.access_token);
        const userResponse = await GetCurrentLoginApi();
        console.log('get current login response:', userResponse);

        if (userResponse.status === 200) {
          const { id, role } = userResponse.data;
          await AsyncStorage.setItem('user_id', id);
          await AsyncStorage.setItem('user_role', role);
          console.log('Stored user_id:', id, 'user_role:', role);

          if (role === 'admin') {
            router.push('/admin/admin');
          } else {
            router.push('/(tabs)');
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

  const handleContinueWithoutLogin = () => {
    router.push('/(tabs)');
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
          placeholder="Tên đăng nhập hoặc Email"
          placeholderTextColor={iconColor}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder="Mật khẩu"
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
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Separator */}
      <View style={styles.separatorContainer}>
        <View style={[styles.separatorLine, { backgroundColor: iconColor }]} />
        <ThemedText style={[styles.separatorText, { color: textColor }]}>hoặc</ThemedText>
        <View style={[styles.separatorLine, { backgroundColor: iconColor }]} />
      </View>

      {/* Continue Without Login */}
      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: buttonBackground }]}
        onPress={handleContinueWithoutLogin}
        disabled={isLoading}
      >
        <ThemedText style={[styles.secondaryButtonText, { color: buttonBackground }]}>
          Tiếp tục không cần đăng nhập
        </ThemedText>
      </TouchableOpacity>

      {/* Signup Link */}
      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => router.push('/signup')}
        disabled={isLoading}
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Login;