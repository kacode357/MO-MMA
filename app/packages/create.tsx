import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createPackage } from '@/services/package.services';
import { uploadImage } from '@/utils/uploadImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';

export default function CreatePackageScreen() {
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false); // Thêm state cho is_premium
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectImage = async () => {
    await uploadImage(setImageUri, setImageUrl, setIsUploading);
  };

  const handleCreatePackage = async () => {
    if (!packageName || !description || !price || !imageUrl) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin và tải ảnh lên.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
      }

      const packageData = {
        package_name: packageName,
        description,
        price: parseFloat(price),
        img_url: imageUrl,
        user_id: userId,
        is_premium: isPremium, // Thêm is_premium vào dữ liệu gửi lên
      };

      const response = await createPackage(packageData);
      if (response.status === 201) {
        Alert.alert('Thành công', 'Tạo gói thành công!');
        // Reset form
        setPackageName('');
        setDescription('');
        setPrice('');
        setImageUri(null);
        setImageUrl(null);
        setIsPremium(false); // Reset is_premium
      } else {
        throw new Error('Tạo gói thất bại.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Tạo gói thất bại.';
      Alert.alert('Lỗi', errorMessage);
      console.error('Lỗi khi tạo gói:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tạo gói mới</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Tên gói"
        value={packageName}
        onChangeText={setPackageName}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Giá (VNĐ)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      
      <ThemedView style={styles.switchContainer}>
        <ThemedText style={styles.switchLabel}>Gói Premium:</ThemedText>
        <Switch
          value={isPremium}
          onValueChange={setIsPremium}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isPremium ? '#007AFF' : '#f4f3f4'}
        />
      </ThemedView>

      <TouchableOpacity
        style={[styles.uploadButton, { opacity: isUploading ? 0.6 : 1 }]}
        onPress={handleSelectImage}
        disabled={isUploading}
      >
        <ThemedText style={styles.buttonText}>
          {isUploading ? 'Đang tải ảnh...' : 'Tải ảnh lên'}
        </ThemedText>
      </TouchableOpacity>
      
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}
      
      <TouchableOpacity
        style={[styles.createButton, { opacity: isSubmitting ? 0.6 : 1 }]}
        onPress={handleCreatePackage}
        disabled={isSubmitting}
      >
        <ThemedText style={styles.buttonText}>
          {isSubmitting ? 'Đang tạo gói...' : 'Tạo gói'}
        </ThemedText>
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
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '80%',
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  createButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
});