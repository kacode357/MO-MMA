import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
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
  is_premium: boolean;
}

export default function PremiumPackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  // Lấy danh sách gói Premium
  const fetchPremiumPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchPackages(
        {
          keyword: '',
          is_delete: false,
          is_premium: true, // Chỉ lấy các gói Premium
        },
        {
          pageNum: 1,
          pageSize: 10,
        }
      );

      if (response.status === 200) {
        setPackages(response.data.pageData);
      } else {
        throw new Error(response.data.message || 'Không thể lấy danh sách gói Premium.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Điều hướng đến màn hình mua gói
  const handlePackagePress = (item: Package) => {
    router.push({
      pathname: '/purchase-screen',
      params: {
        package_id: item.package_id,
        package_name: item.package_name,
        package_description: item.description || 'Không có mô tả',
        package_price: item.price.toString(),
      },
    });
  };

  useEffect(() => {
    fetchPremiumPackages();
  }, []);

  const renderPackageItem = ({ item }: { item: Package }) => (
    <TouchableOpacity
      style={[styles.packageItem, { backgroundColor: colors.listItem, borderColor: colors.border }]}
      onPress={() => handlePackagePress(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={[styles.packageContainer, { backgroundColor: colors.listItem }]}>
        {item.img_url ? (
          <Image source={{ uri: item.img_url }} style={styles.packageImage} resizeMode="cover" />
        ) : (
          <ThemedView style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
            <ThemedText style={[styles.placeholderText, { color: colors.text }]}>Không có ảnh</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.packageInfo}>
          <ThemedText style={[styles.packageName, { color: colors.text }]}>{item.package_name}</ThemedText>
          <ThemedText style={[styles.packageDescription, { color: colors.text }]} numberOfLines={2}>
            {item.description || 'Không có mô tả'}
          </ThemedText>
          <ThemedText style={[styles.packagePrice, { color: colors.button }]}>
            {item.price === 0 ? 'Miễn phí' : `${item.price.toLocaleString()} VNĐ`}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.errorText, { color: colors.text }]}>Lỗi: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Danh sách gói Premium
      </ThemedText>
      {packages.length === 0 ? (
        <ThemedText style={[styles.noDataText, { color: colors.text }]}>Không có gói Premium nào.</ThemedText>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.package_id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 16 },
  listContainer: { paddingBottom: 16 },
  packageItem: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageContainer: { flexDirection: 'row', alignItems: 'center' },
  packageImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 12 },
  packageInfo: { flex: 1 },
  packageName: { fontSize: 18, fontWeight: 'bold' },
  packageDescription: { fontSize: 14, marginVertical: 4 },
  packagePrice: { fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 16 },
  noDataText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
});