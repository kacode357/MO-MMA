import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { checkAccessPackage, searchPackages } from '@/services/package.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';

// Import hình ảnh chatbot
import chatbotImage from '@/assets/images/chatbot.png';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  price: number;
  img_url: string;
  created_at: string;
  is_delete: boolean;
}

export default function HomeScreen() {
  // States
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState<string | null>(null);
  const [modal, setModal] = useState({
    visible: false,
    message: '',
    package_id: '',
    package_name: '',
    package_description: '',
    package_price: 0,
    user_id: '',
  });

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  // Lấy danh sách gói
  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await searchPackages({ keyword: '', is_delete: false,  is_premium: false,}, { pageNum: 1, pageSize: 10 });
    
      if (response.status !== 200) throw new Error(response.data.message || 'Không thể lấy danh sách gói.');
      setPackages(response.data.pageData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kiểm tra quyền truy cập gói
  // Kiểm tra quyền truy cập gói
const handleCheckAccess = async (packageId: string, packageName: string, description: string, price: number) => {
  console.log('handleCheckAccess - description:', description);
  setCheckingAccess(packageId);
  try {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');

    const response = await checkAccessPackage(userId, packageId);
    console.log('handleCheckAccess - response:', response);
    if (response.status === 200 && response.data.has_access) {
      // Extract first element of supported_features and ai_model
      const firstSupportedFeature = response.data.package.supported_features[0] || null;
      const aiModel = response.data.package.ai_model || null;

      // Push firstSupportedFeature, aiModel, and packageId as params
      router.push({
        pathname: '/model-ai/all-model',
        params: {
          first_supported_feature: firstSupportedFeature,
          ai_model: aiModel,
          package_id: packageId, // Add package_id to params
        },
      });
    } else {
      throw new Error('Bạn không có quyền truy cập gói này. Vui lòng mua để tiếp tục.');
    }
  } catch (err: any) {
    setModal({
      visible: true,
      message: err.response?.data?.message || err.message,
      package_id: packageId,
      package_name: packageName,
      package_description: description || 'Không có mô tả',
      package_price: price,
      user_id: await AsyncStorage.getItem('user_id') || '',
    });
  } finally {
    setCheckingAccess(null);
  }
};

  // Đóng modal
  const closeModal = () => setModal({ visible: false, message: '', package_id: '', package_name: '', package_description: '', package_price: 0, user_id: '' });

  // Xử lý nhấn vào gói
  const handlePackagePress = (packageId: string, packageName: string, description: string, price: number) => {
    if (!checkingAccess) handleCheckAccess(packageId, packageName, description, price);
  };

  // Render mỗi item gói
  const renderPackageItem = useCallback(
    ({ item }: { item: Package }) => {
     
      return (
        <TouchableOpacity
          style={[styles.packageItem, {
            opacity: checkingAccess === item.package_id ? 0.6 : 1,
            backgroundColor: colors.listItem,
            borderColor: colors.border,
          }]}
          onPress={() => handlePackagePress(item.package_id, item.package_name, item.description, item.price)}
          disabled={!!checkingAccess}
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
    },
    [checkingAccess, colors]
  );

  // Lấy danh sách gói khi khởi tạo
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Giao diện chính
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
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>Danh sách gói</ThemedText>
      {packages.length === 0 ? (
        <ThemedText style={[styles.noDataText, { color: colors.text }]}>Không có gói nào.</ThemedText>
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

      {/* Modal thông báo không có quyền truy cập */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal.visible}
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={[styles.closeButtonText, { color: colors.icon }]}>✕</ThemedText>
            </TouchableOpacity>
            <Image source={chatbotImage} style={styles.modalIcon} resizeMode="contain" />
            <ThemedText style={[styles.modalMessage, { color: colors.text }]}>{modal.message}</ThemedText>
            <TouchableOpacity
              style={[styles.buyButton, { backgroundColor: colors.button }]}
              onPress={() => {
                console.log('modal.package_description before router.push:', modal.package_description);
                closeModal();
                router.push({
                  pathname: '/purchase-screen',
                  params: {
                    package_id: modal.package_id,
                    package_name: modal.package_name,
                    package_description: modal.package_description,
                    package_price: modal.package_price.toString(), // Convert to string for router params
                    user_id: modal.user_id,
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.buyButtonText}>Mua ngay</ThemedText>
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
  loadingText: { marginTop: 8, fontSize: 16 },
  errorText: { fontSize: 16 },
  noDataText: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  closeButton: { position: 'absolute', top: 10, right: 10, padding: 5 },
  closeButtonText: { fontSize: 20, fontWeight: 'bold' },
  modalIcon: { width: 60, height: 60, marginBottom: 15 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});