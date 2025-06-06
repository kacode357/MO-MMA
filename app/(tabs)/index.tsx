import chatbotImage from '@/assets/images/chatbot.png';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { checkAccessPackage, searchPackages } from '@/services/package.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
}

export default function HomeScreen() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // New state for refresh control
  const [modal, setModal] = useState({ visible: false, message: '', package_id: '', package_name: '', package_description: '', package_price: 0, user_id: '' });

  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchPackages({ keyword: '', is_delete: false, is_premium: false }, { pageNum: 1, pageSize: 10 });
      if (response.status !== 200) throw new Error(response.data.message || 'Failed to fetch packages');
      setPackages(response.data.pageData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null); // Clear any previous errors
    try {
      const response = await searchPackages({ keyword: '', is_delete: false, is_premium: false }, { pageNum: 1, pageSize: 10 });
      if (response.status !== 200) throw new Error(response.data.message || 'Failed to fetch packages');
      setPackages(response.data.pageData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCheckAccess = useCallback(async (packageId: string, packageName: string, description: string, price: number) => {
    setCheckingAccess(packageId);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User not logged in');
      const response = await checkAccessPackage(userId, packageId);
      if (response.status === 200 && response.data.has_access) {
        router.push({
          pathname: '/model-ai/all-model',
          params: {
            first_supported_feature: response.data.package.supported_features[0] || null,
            ai_model: response.data.package.ai_model || null,
            package_id: packageId,
          },
        });
      } else {
        throw new Error('Access denied. Please purchase to continue.');
      }
    } catch (err: any) {
      setModal({
        visible: true,
        message: err.response?.data?.message || err.message,
        package_id: packageId,
        package_name: packageName,
        package_description: description || 'No description',
        package_price: price,
        user_id: await AsyncStorage.getItem('user_id') || '',
      });
    } finally {
      setCheckingAccess(null);
    }
  }, []);

  const closeModal = useCallback(() => setModal({ visible: false, message: '', package_id: '', package_name: '', package_description: '', package_price: 0, user_id: '' }), []);

  const renderPackageItem = useCallback(
    ({ item }: { item: Package }) => (
      <TouchableOpacity
        style={[styles.packageItem, { opacity: checkingAccess === item.package_id ? 0.6 : 1, backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => handleCheckAccess(item.package_id, item.package_name, item.description, item.price)}
        disabled={!!checkingAccess}
        activeOpacity={0.7}
      >
        {item.img_url ? (
          <Image source={{ uri: item.img_url }} style={styles.packageImage} resizeMode="cover" />
        ) : (
          <ThemedView style={[styles.placeholderImage, { backgroundColor: colors.border }]}>
            <ThemedText style={[styles.placeholderText, { color: colors.text }]}>No image</ThemedText>
          </ThemedView>
        )}
        <ThemedView style={styles.packageInfo}>
          <ThemedText style={[styles.packageName, { color: colors.text }]}>{item.package_name}</ThemedText>
          <ThemedText style={[styles.packageDescription, { color: colors.text }]} numberOfLines={2}>
            {item.description || 'No description'}
          </ThemedText>
          <ThemedText style={[styles.packagePrice, { color: colors.button }]}>
            {item.price === 0 ? 'Free' : `${item.price.toLocaleString()} VNĐ`}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    ),
    [checkingAccess, colors, handleCheckAccess]
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (isLoading) return <ThemedView style={[styles.container, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.icon} /></ThemedView>;
  if (error) return <ThemedView style={[styles.container, { backgroundColor: colors.background }]}><ThemedText style={[styles.errorText, { color: colors.text }]}>Error: {error}</ThemedText></ThemedView>;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>Gói AI của Kalus</ThemedText>
      {packages.length === 0 ? (
        <ThemedText style={[styles.noDataText, { color: colors.text }]}>No packages available</ThemedText>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.package_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.button]} // Spinner color
              tintColor={colors.button} // iOS spinner color
            />
          }
        />
      )}
      <Modal animationType="fade" transparent visible={modal.visible} onRequestClose={closeModal}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={[styles.closeButtonText, { color: colors.icon }]}>✕</ThemedText>
            </TouchableOpacity>
            <Image source={chatbotImage} style={styles.modalIcon} resizeMode="contain" />
            <ThemedText style={[styles.modalMessage, { color: colors.text }]}>{modal.message}</ThemedText>
            <TouchableOpacity
              style={[styles.buyButton, { backgroundColor: colors.button }]}
              onPress={() => {
                closeModal();
                router.push({
                  pathname: '/purchase-screen',
                  params: {
                    package_id: modal.package_id,
                    package_name: modal.package_name,
                    package_description: modal.package_description,
                    package_price: modal.package_price.toString(),
                    user_id: modal.user_id,
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 16 },
  listContainer: { paddingBottom: 16 },
  packageItem: { flexDirection: 'row', padding: 12, marginVertical: 8, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  packageImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  placeholderImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 12 },
  packageInfo: { flex: 1 },
  packageName: { fontSize: 18, fontWeight: 'bold' },
  packageDescription: { fontSize: 14, marginVertical: 4 },
  packagePrice: { fontSize: 14, fontWeight: '600' },
  errorText: { fontSize: 16, textAlign: 'center' },
  noDataText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', padding: 20, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, alignItems: 'center' },
  closeButton: { position: 'absolute', top: 10, right: 10, padding: 5 },
  closeButtonText: { fontSize: 20, fontWeight: 'bold' },
  modalIcon: { width: 60, height: 60, marginBottom: 15 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buyButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});