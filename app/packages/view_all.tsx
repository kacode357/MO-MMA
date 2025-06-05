import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { searchPackages } from '@/services/package.services';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
  created_at: string;
  is_delete: boolean;
}

export default function ViewAll() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handlePackagePress = (packageId: string) => {
    router.push({
      pathname: '/packages/details',
      params: { id: packageId },
    });
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const renderPackageItem = ({ item }: { item: Package }) => (
    <TouchableOpacity
      style={styles.packageItem}
      onPress={() => handlePackagePress(item.package_id)}
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
            <ThemedText style={styles.placeholderText}>No Image</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.packageInfo}>
          <ThemedText style={styles.packageName}>{item.package_name}</ThemedText>
          <ThemedView style={styles.descriptionPriceContainer}>
            <ThemedText style={styles.packageDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <ThemedText style={styles.packagePrice}>{item.price} VNĐ</ThemedText>
          </ThemedView>
        </ThemedView>
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
      <ThemedText type="title">Tất cả gói</ThemedText>
      {packages.length === 0 ? (
        <ThemedText style={styles.noDataText}>Không có gói nào.</ThemedText>
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
  },
  listContainer: {
    paddingBottom: 16,
  },
  packageItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
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
  descriptionPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  packagePrice: {
    fontSize: 14,
    color: '#007AFF',
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