import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getPackageById } from '@/services/package.services';
import { CheckPurchaseApi, CreatePurchaseApi, UpgradePremiumPurchaseApi } from '@/services/purchase.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Import hình ảnh
import purchaseImage from '@/assets/images/img-purchase.jpg';

export default function PurchaseScreen() {
  const { package_id, package_name, package_description, package_price, user_id: userIdFromParams } = useLocalSearchParams();

  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [response, setResponse] = useState<{ ok: boolean; message: string; data?: any } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('qr_code');
  const [isPremiumPackage, setIsPremiumPackage] = useState<boolean | null>(null);
  const [finalUserId, setFinalUserId] = useState<string | null>(null); // State để lưu user_id cuối cùng

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  // Lấy user_id từ AsyncStorage hoặc params
  const fetchUserId = async () => {
    try {
      const userIdFromStorage = await AsyncStorage.getItem('user_id');
      if (userIdFromStorage) {
        console.log('User ID from AsyncStorage:', userIdFromStorage);
        setFinalUserId(userIdFromStorage);
      } else if (userIdFromParams) {
        console.log('User ID from params:', userIdFromParams);
        setFinalUserId(userIdFromParams as string);
      } else {
        throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
      }
    } catch (err: any) {
      console.error('Error fetching user_id:', err.message);
      setFinalUserId(null);
    }
  };

  // Lấy thông tin gói để kiểm tra is_premium
  const fetchPackageInfo = async () => {
    try {
      const packageResponse = await getPackageById(package_id as string);
      console.log('getPackageById response:', packageResponse.data);
      if (packageResponse.status === 200 ) {
        setIsPremiumPackage(packageResponse.data.is_premium);
      } else {
        throw new Error('Không thể lấy thông tin gói.');
      }
    } catch (err: any) {
      console.error('Error fetching package info:', err.message);
      setIsPremiumPackage(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserId();
      await fetchPackageInfo();
    };
    initialize();
  }, [package_id, userIdFromParams]);

  // Xử lý kiểm tra và tạo giao dịch
  const handleCreatePurchase = async () => {
    if (!finalUserId) {
      setResponse({
        ok: false,
        message: 'Không tìm thấy user_id. Vui lòng đăng nhập lại.',
      });
      return;
    }

    setIsChecking(true);
    try {
      // Kiểm tra xem đã có purchase chưa
      const checkResponse = await CheckPurchaseApi({ user_id: finalUserId, package_id: package_id as string });
      console.log('CheckPurchaseApi response:', checkResponse);

     if (checkResponse.data  != null) {
        // Nếu đã có purchase, hiển thị thông tin purchase hiện có
        console.log('Purchase already exists:', checkResponse);
        setResponse({
          ok: true,
          message: 'Giao dịch đã tồn tại.',
          data: checkResponse.data,
       
        });
      } else {
        // Nếu chưa có purchase, gọi API tạo mới
        console.log('Creating new purchase...');
        setIsCreating(true);

        let createResponse;
        console.log('isPremiumPackage:', isPremiumPackage);
        if (isPremiumPackage) {
          console.log('Creating Premium purchase...');
          // Nếu là gói Premium, gọi UpgradePremiumPurchaseApi
          createResponse = await UpgradePremiumPurchaseApi({ package_id: package_id as string });
          console.log('UpgradePremiumPurchaseApi response:', createResponse);
        } else {
          // Nếu không phải gói Premium, gọi CreatePurchaseApi
          createResponse = await CreatePurchaseApi({ user_id: finalUserId, package_id: package_id as string });
          console.log('CreatePurchaseApi response:', createResponse);
        }

        if (createResponse.status === 201 || createResponse.status === 200) {
          setResponse({
            ok: true,
            message: createResponse.data.message,
            data: createResponse.data,
          });
        } else {
          throw new Error(createResponse.data.message || 'Không thể tạo giao dịch.');
        }
      }
    } catch (err: any) {
      setResponse({
        ok: false,
        message: err.message || 'Lỗi khi xử lý giao dịch.',
      });
    } finally {
      setIsChecking(false);
      setIsCreating(false);
    }
  };

  // Điều hướng đến màn hình lịch sử giao dịch
  const handleViewHistory = () => {
    router.push('/history-screen');
  };

  // Điều hướng đến màn hình thanh toán
  const handlePayment = () => {
    router.push({
      pathname: '/payment-screen',
      params: {
        user_id: finalUserId,
        purchase_id: response?.data?.purchase_id,
        amount: parseFloat(package_price as string).toString(),
        payment_method: paymentMethod,
      },
    });
  };

  if (isPremiumPackage === null || finalUserId === null) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>Đang kiểm tra thông tin...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hình ảnh ở phía trên */}
      <Image source={purchaseImage} style={styles.headerImage} resizeMode="cover" />

      {/* Phần nội dung tràn màn hình */}
      <ThemedView style={styles.contentContainer}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
          Xác nhận mua gói
        </ThemedText>
        <ThemedView style={[styles.infoContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
          <ThemedText style={[styles.infoText, { color: colors.text }]}>Gói: {package_name}</ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.text }]}>Giá: {parseFloat(package_price as string).toLocaleString()} VNĐ</ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.text }]}>Mô tả: {package_description || 'Không có mô tả'}</ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.text }]}>ID gói: {package_id}</ThemedText>
          <ThemedText style={[styles.infoText, { color: colors.text }]}>ID người dùng: {finalUserId}</ThemedText>
          {isPremiumPackage && (
            <ThemedText style={[styles.infoText, { color: colors.text }]}>Loại gói: Premium</ThemedText>
          )}
        </ThemedView>

        {/* Hiển thị response hoặc nút xác nhận */}
        {response ? (
          <>
            <ThemedText style={[styles.responseTitle, { color: colors.text }]}>
              Thông tin hóa đơn
            </ThemedText>
            <ThemedView style={[styles.responseContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
              <ThemedText style={[styles.responseText, { color: response.ok ? colors.button : colors.text }]}>
                {response.message}
              </ThemedText>
              {response.data && (
                <>
                  <ThemedText style={[styles.responseField, { color: colors.text }]}>
                    Mã giao dịch: {response.data.purchase_id}
                  </ThemedText>
                  <ThemedText style={[styles.responseField, { color: colors.text }]}>
                    Gói: {response.data.package_name}
                  </ThemedText>
                  {response.data.price && (
                    <ThemedText style={[styles.responseField, { color: colors.text }]}>
                      Giá: {response.data.price.toLocaleString()} VNĐ
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.responseField, { color: colors.text }]}>
                    Tên Người dùng: {response.data.username}
                  </ThemedText>
                  <ThemedText style={[styles.responseField, { color: colors.text }]}>
                    Thời gian: {new Date(response.data.created_at).toLocaleString()}
                  </ThemedText>
                  {response.data.status && (
                    <ThemedText style={[styles.responseField, { color: colors.text }]}>
                      Trạng thái: {response.data.status}
                    </ThemedText>
                  )}
                  {response.data.updated_role && (
                    <ThemedText style={[styles.responseField, { color: colors.text }]}>
                      Vai trò mới: {response.data.updated_role}
                    </ThemedText>
                  )}
                </>
              )}
            </ThemedView>

            {/* Lựa chọn phương thức thanh toán và mã QR */}
            {response.ok && (
              <ThemedView style={styles.paymentContainer}>
                <TouchableOpacity
                  style={[styles.paymentMethodButton, { backgroundColor: colors.listItem, borderColor: colors.border }]}
                  onPress={() => setPaymentMethod('qr_code')}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.paymentMethodText, { color: colors.text }]}>
                    Phương thức thanh toán
                  </ThemedText>
                </TouchableOpacity>
                <ThemedView style={[styles.qrPlaceholder, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
                  <ThemedText style={[styles.qrPlaceholderText, { color: colors.text }]}>
                    Mã QR
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            {/* Nút "Xem lịch sử" và "Thanh toán" */}
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.historyButton, { borderColor: colors.border }]}
                onPress={handleViewHistory}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.historyButtonText, { color: colors.text }]}>Xem lịch sử</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentButton, { backgroundColor: colors.button }]}
                onPress={handlePayment}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.paymentButtonText}>Thanh toán</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        ) : (
          <>
            <ThemedText style={[styles.confirmText, { color: colors.text }]}>
              Bạn có muốn tạo giao dịch mua gói này không?
            </ThemedText>
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => router.back()}
                disabled={isChecking || isCreating}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.button, opacity: isChecking || isCreating ? 0.6 : 1 }]}
                onPress={handleCreatePurchase}
                disabled={isChecking || isCreating}
                activeOpacity={0.7}
              >
                {isChecking || isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.createButtonText}>Tạo giao dịch</ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>
          </>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 20 },
  headerImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  infoContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: { fontSize: 16, marginBottom: 8 },
  confirmText: { fontSize: 18, textAlign: 'center', marginBottom: 10 },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  paymentMethodText: { fontSize: 16, fontWeight: '600' },
  qrPlaceholder: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholderText: { fontSize: 14, textAlign: 'center' },
  responseTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  responseContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseText: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  responseField: { fontSize: 16, marginBottom: 8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  createButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  historyButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1 },
  historyButtonText: { fontSize: 16, fontWeight: '600' },
  paymentButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  paymentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingText: { marginTop: 8, fontSize: 16 },
});