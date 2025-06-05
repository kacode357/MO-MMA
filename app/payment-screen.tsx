import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CheckPaymentApi, CreatePaymentApi } from '@/services/payment.services';
import { CompletePurchaseApi } from '@/services/purchase.services'; // Thêm import
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';

export default function PaymentScreen() {
  const { user_id, purchase_id, amount, payment_method } = useLocalSearchParams();
  console.log('Received params:', { user_id, purchase_id, amount, payment_method });

  const [paymentData, setPaymentData] = useState<{
    payment_id: string;
    purchase_id: string;
    payment_status: string;
    qr_code_url: string;
    reference_code: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [roleUpdated, setRoleUpdated] = useState<string | null>(null); // Thêm state để theo dõi role

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Call CreatePaymentApi on mount
  useEffect(() => {
    const createPayment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await CreatePaymentApi({
          user_id: user_id as string,
          purchase_id: purchase_id as string,
          amount: parseFloat(amount as string),
          payment_method: payment_method as string,
        });
        console.log('CreatePaymentApi response:', response.data);
        if (response.status === 201) {
          setPaymentData(response.data);
        } else {
          throw new Error(response.data.message || 'Không thể tạo thanh toán.');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tạo thanh toán.');
      } finally {
        setIsLoading(false);
      }
    };

    createPayment();
  }, [user_id, purchase_id, amount, payment_method]);

  // Poll CheckPaymentApi every 10 seconds
  useEffect(() => {
    if (!paymentData || paymentData.payment_status !== 'pending') return;

    const checkPaymentStatus = async () => {
      try {
        const response = await CheckPaymentApi({
          user_id: user_id as string,
          payment_id: paymentData.payment_id,
          reference_code: paymentData.reference_code,
        });
        console.log('CheckPaymentApi response:', response.data);
        if (response.status === 200 ) {
          setPaymentData(response.data);
          if (response.data.payment_status === 'success') {
            // Thanh toán thành công, gọi CompletePurchaseApi
            const completeResponse = await CompletePurchaseApi({
              purchase_id: purchase_id as string,
            });
            console.log('CompletePurchaseApi response:', completeResponse.data);
            if (completeResponse.status === 200) {
              // Kiểm tra nếu role được nâng cấp
              if (completeResponse.data.updated_role) {
                setRoleUpdated(completeResponse.data.updated_role);
                // Cập nhật role vào AsyncStorage
                await AsyncStorage.setItem('user_role', completeResponse.data.updated_role);
                console.log('User role updated in AsyncStorage:', completeResponse.data.updated_role);
              }
            } else {
              console.error('CompletePurchaseApi failed:', completeResponse.data.message);
            }
            setModalVisible(true);
            // Dừng interval khi thanh toán thành công
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } else {
          throw new Error(response.data.message || 'Không thể kiểm tra trạng thái thanh toán.');
        }
      } catch (err: any) {
        console.error('CheckPaymentApi error:', err.message);
      }
    };

    intervalRef.current = setInterval(checkPaymentStatus, 10000); // 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paymentData, user_id, purchase_id]);

  // Handle back navigation
  const handleBack = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    router.push('/(tabs)');
  };

  // Close modal and navigate back
  const closeModal = () => {
    setModalVisible(false);
    handleBack();
  };

  // Main UI
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
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.text }]}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Thanh toán
      </ThemedText>

      <ThemedView style={[styles.infoContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
        <ThemedText style={[styles.infoText, { color: colors.text }]}>ID Người dùng: {user_id}</ThemedText>
        <ThemedText style={[styles.infoText, { color: colors.text }]}>Mã giao dịch: {purchase_id}</ThemedText>
        <ThemedText style={[styles.infoText, { color: colors.text }]}>
          Số tiền: {parseFloat(amount as string).toLocaleString()} VNĐ
        </ThemedText>
        <ThemedText style={[styles.infoText, { color: colors.text }]}>Phương thức: {payment_method}</ThemedText>
        {paymentData && (
          <>
            <ThemedText style={[styles.infoText, { color: colors.text }]}>Mã thanh toán: {paymentData.payment_id}</ThemedText>
            <ThemedText style={[styles.infoText, { color: colors.text }]}>Mã tham chiếu: {paymentData.reference_code}</ThemedText>
            <ThemedText style={[styles.infoText, { color: colors.text }]}>Trạng thái: {paymentData.payment_status}</ThemedText>
          </>
        )}
      </ThemedView>

      {payment_method === 'qr_code' && paymentData?.qr_code_url && paymentData.payment_status === 'pending' && (
        <ThemedView style={[styles.qrContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
          <Image
            source={{ uri: paymentData.qr_code_url }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <ThemedText style={[styles.qrInstructionText, { color: colors.text }]}>
            Quét mã QR để thanh toán
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.buttonContainer}>
        {paymentData?.payment_status === 'pending' && (
          <TouchableOpacity
            style={[styles.checkButton, { backgroundColor: colors.button, opacity: 1 }]}
            disabled={true}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.checkButtonText}>Đang chờ thanh toán</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.text }]}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={[styles.closeButtonText, { color: colors.icon }]}>✕</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.modalMessage, { color: colors.text }]}>
              Thanh toán thành công!
              {roleUpdated && `\nBạn đã được nâng cấp lên ${roleUpdated}!`}
            </ThemedText>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.button }]}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.modalButtonText}>Đóng</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 20 },
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
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrImage: { width: 200, height: 200, marginBottom: 10 },
  qrInstructionText: { fontSize: 16, textAlign: 'center' },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  checkButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});