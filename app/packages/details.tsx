import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getPackageById } from '@/services/package.services';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
  created_at: string;
  is_delete: boolean;
}

export default function PackageDetail() {
  const { id } = useLocalSearchParams(); // Lấy package_id từ params
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPackageById(id as string);
      if (response.status === 200) {
     
        setPackageData(response.data);
      } else {
        throw new Error(response.data.message || 'Không thể lấy thông tin gói.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      Alert.alert('Lỗi', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
    <ThemedView style={styles.container}>
      <ThemedText type="title">{packageData.package_name}</ThemedText>
      {packageData.img_url ? (
        <Image
          source={{ uri: packageData.img_url }}
          style={styles.packageImage}
          resizeMode="cover"
        />
      ) : (
        <ThemedView style={styles.placeholderImage}>
          <ThemedText style={styles.placeholderText}>No Image</ThemedText>
        </ThemedView>
      )}
      <ThemedText style={styles.packageDescription}>{packageData.description}</ThemedText>
      <ThemedText style={styles.packagePrice}>Giá: {packageData.price} VNĐ</ThemedText>
      <ThemedText style={styles.packageCreatedAt}>
        Ngày tạo: {new Date(packageData.created_at).toLocaleDateString('vi-VN')}
      </ThemedText>
      <ThemedText style={styles.packageStatus}>
        Trạng thái: {packageData.is_delete ? 'Đã xóa' : 'Hoạt động'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  packageDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  packagePrice: {
    fontSize: 16,
    color: '#007AFF',
    marginVertical: 8,
  },
  packageCreatedAt: {
    fontSize: 14,
    color: '#999',
    marginVertical: 8,
  },
  packageStatus: {
    fontSize: 14,
    color: '#333',
    marginVertical: 8,
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