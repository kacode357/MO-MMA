import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function AdminScreen() {
  const handleLogout = async () => {
    try {
      // Xóa access_token và refresh_token từ AsyncStorage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      // Xóa các dữ liệu khác nếu cần (user_id, user_role, v.v.)
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('user_role');

      console.log('Đã xóa access_token và refresh_token');
      Alert.alert('Thành công', 'Đăng xuất thành công!');

      // Điều hướng về trang đăng nhập
      router.replace('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleManagePackages = () => {
    router.push('/packages/packages'); // Điều hướng đến trang quản lý các gói
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Trang Admin</ThemedText>
      <TouchableOpacity
        style={styles.manageButton}
        onPress={handleManagePackages}
      >
        <ThemedText style={styles.buttonText}>Quản lý các gói</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <ThemedText style={styles.buttonText}>Đăng xuất</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  manageButton: {
    backgroundColor: '#007AFF', // Màu xanh cho nút quản lý
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#FF0000', // Màu đỏ cho nút đăng xuất
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});