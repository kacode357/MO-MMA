import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { deletePackage, searchPackages } from '@/services/package.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
  created_at: string;
  is_delete: boolean;
}

export default function Delete() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchPackages(
        {
          keyword: '',
          is_delete: false,
        },
        {
          pageNum: 1,
          pageSize: 10,
        }
      );

      if (response.status === 200) {
        setPackages(response.data.pageData);
      } else {
        throw new Error(response.data.message || 'Không thể lấy danh sách gói.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    setIsDeleting(packageId);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
      }

      const response = await deletePackage(packageId, { user_id: userId });
      if (response.status === 200) {
        Alert.alert('Thành công', 'Xóa gói thành công!', [
          { text: 'OK', onPress: () => fetchPackages() },
        ]);
      } else {
        throw new Error(response.data.message || 'Xóa gói thất bại.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Xóa gói thất bại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const confirmDeletePackage = (packageId: string, packageName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa gói "${packageName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => handleDeletePackage(packageId),
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const renderPackageItem = ({ item }: { item: Package }) => (
    <TouchableOpacity
      style={[styles.packageItem, { opacity: isDeleting === item.package_id ? 0.6 : 1 }]}
      onPress={() => confirmDeletePackage(item.package_id, item.package_name)}
      disabled={isDeleting === item.package_id}
      activeOpacity={0.8}
    >
      <ThemedView style={styles.packageContainer}>
        {item.img_url ? (
          <Image
            source={{ uri: item.img_url }}
            style={styles.packageImage}
            resizeMode="cover"
          />
        ) : (
          <ThemedView style={styles.placeholderImage}>
            <ThemedText style={styles.placeholderText}>Không có ảnh</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.packageInfo}>
          <ThemedText style={styles.packageName}>{item.package_name}</ThemedText>
          <ThemedText style={styles.packageDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.packagePrice}>{item.price} VNĐ</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => confirmDeletePackage(item.package_id, item.package_name)}
          disabled={isDeleting === item.package_id}
        >
          <Icon
            name="delete"
            size={24}
            color={isDeleting === item.package_id ? '#888' : '#FF0000'}
          />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

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

  return (
    <ThemedView style={styles.container}>
      {packages.length === 0 ? (
        <ThemedText style={styles.noDataText}>Không có gói nào để xóa.</ThemedText>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.package_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 16,
  },
  packageItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28A745',
  },
  deleteIcon: {
    padding: 8,
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
    textAlign: 'center',
  },
});