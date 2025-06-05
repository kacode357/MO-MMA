import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPackageById, updatePackage } from '@/services/package.services';
import { uploadImage } from '@/utils/uploadImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
  created_at: string;
  is_delete: boolean;
}

export default function UpdatePackage() {
  const { id } = useLocalSearchParams();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    package_name: '',
    description: '',
    price: '',
    img_url: '',
  });

  const fetchPackageDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPackageById(id as string);
      if (response.status === 200) {
        setPackageData(response.data);
        setFormData({
          package_name: response.data.package_name,
          description: response.data.description,
          price: response.data.price.toString(),
          img_url: response.data.img_url,
        });
      } else {
        throw new Error(response.data.message || 'Không thể lấy thông tin gói.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleSelectImage = async () => {
    const result = await uploadImage(
      (uri) => setFormData({ ...formData, img_url: uri || '' }),
      (url) => setFormData({ ...formData, img_url: url || '' }),
      setIsUploading
    );
    if (result.imageUrl) {
      setFormData({ ...formData, img_url: result.imageUrl });
    }
  };

  const handleUpdatePackage = async () => {
    if (!formData.package_name || !formData.description || !formData.price || !formData.img_url) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
      }

      const updatedData = {
        package_name: formData.package_name,
        description: formData.description,
        price: parseFloat(formData.price),
        img_url: formData.img_url,
        user_id: userId,
      };

      const response = await updatePackage(id as string, updatedData);
      if (response.status === 200) {
        Alert.alert('Thành công', 'Cập nhật gói thành công!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setPackageData(response.data.data);
        setFormData({
          package_name: response.data.package_name,
          description: response.data.description,
          price: response.data.price.toString(),
          img_url: response.data.img_url,
        });
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Cập nhật gói thất bại.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật gói thất bại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      package_name: packageData?.package_name || '',
      description: packageData?.description || '',
      price: packageData?.price.toString() || '',
      img_url: packageData?.img_url || '',
    });
  };

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Lỗi: {error}</ThemedText>
      </ThemedView>
    );
  }

  if (!packageData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noDataText}>Không tìm thấy gói.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Cập nhật gói</ThemedText>

        {formData.img_url ? (
          <Image
            source={{ uri: formData.img_url }}
            style={styles.packageImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.placeholderImage}>
            <ThemedText style={styles.placeholderText}>Không có ảnh</ThemedText>
          </ThemedView>
        )}

        {isEditing && (
          <TouchableOpacity
            style={[styles.uploadButton, { opacity: isUploading ? 0.6 : 1 }]}
            onPress={handleSelectImage}
            disabled={isUploading}
          >
            <ThemedText style={styles.buttonText}>
              {isUploading ? 'Đang tải ảnh...' : 'Tải ảnh mới'}
            </ThemedText>
          </TouchableOpacity>
        )}

        <ThemedText style={styles.label}>Tên gói:</ThemedText>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={formData.package_name}
          onChangeText={(text) => setFormData({ ...formData, package_name: text })}
          editable={isEditing}
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Mô tả:</ThemedText>
        <TextInput
          style={[styles.input, styles.descriptionInput, !isEditing && styles.inputDisabled]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          editable={isEditing}
          multiline
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Giá (VNĐ):</ThemedText>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          editable={isEditing}
          keyboardType="numeric"
        />

        {isEditing ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.updateButton, { opacity: isSubmitting ? 0.6 : 1 }]}
              onPress={handleUpdatePackage}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.buttonText}>
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.buttonText}>Hủy</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditToggle}
          >
            <ThemedText style={styles.buttonText}>Chỉnh sửa</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  packageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginTop: 8,
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
  inputDisabled: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#f0f0f0',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
  },
  updateButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});