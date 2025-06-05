import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function ManagePackagesScreen() {
  const handleViewAllPackages = () => {
    router.push('/packages/view_all'); // Điều hướng đến trang hiển thị tất cả gói
  };

  const handleCreatePackage = () => {
    router.push('/packages/create'); // Điều hướng đến trang tạo gói mới
  };

  const handleUpdatePackage = () => {
    router.push('/packages/update'); // Điều hướng đến trang cập nhật gói
  };

  const handleDeletePackage = () => {
    router.push('/packages/delete'); // Điều hướng đến trang xóa gói
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Quản lý các gói</ThemedText>
      <TouchableOpacity
        style={styles.button}
        onPress={handleViewAllPackages}
      >
        <ThemedText style={styles.buttonText}>Tất cả gói</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleCreatePackage}
      >
        <ThemedText style={styles.buttonText}>Tạo gói mới</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpdatePackage}
      >
        <ThemedText style={styles.buttonText}>Cập nhật gói</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeletePackage}
      >
        <ThemedText style={styles.buttonText}>Xóa gói</ThemedText>
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
  button: {
    backgroundColor: '#007AFF', // Màu xanh cho các nút
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF0000', // Màu đỏ cho nút xóa
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});