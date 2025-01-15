import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from "react-native";
import WebView from "react-native-webview";
import { createPayment, getCartById } from "../../services/api";

type VNPayPaymentScreenProps = {
  route: { params: { cartId: string; totalPrice: number } };
  navigation: any;
};

const VNPayPaymentScreen: React.FC<VNPayPaymentScreenProps> = ({ route, navigation }) => {
  const { cartId, totalPrice } = route.params;
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const fetchCartStatus = async () => {
      try {
        const cartData = await getCartById(cartId);
        if (cartData.status === "completed") {
          setIsCompleted(true);
        } else {
          setIsCompleted(false);
          const response = await createPayment(cartId, totalPrice);
          if (response.paymentUrl) {
            setPaymentUrl(response.paymentUrl);
          } else {
            Alert.alert("Error", "Không lấy được URL thanh toán VN PAY.");
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Đã xảy ra lỗi khi kiểm tra trạng thái giỏ hàng hoặc tạo thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartStatus();
  }, [cartId, totalPrice]);

  const handleExportPDF = () => {
    Alert.alert("Xuất PDF", "Chức năng xuất PDF chưa được triển khai.");
  };

  const handlePrint = () => {
    Alert.alert("In hóa đơn", "Chức năng in chưa được triển khai.");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedText}>Thanh toán đã hoàn tất. Không cần thực hiện lại.</Text>
        <Button title="Trở về HomePos" onPress={() => navigation.navigate("HomePos")} />
        <View style={styles.buttonContainer}>
          <Button title="Xuất PDF" onPress={handleExportPDF} />
          <Button title="In hóa đơn" onPress={handlePrint} />
        </View>
      </View>
    );
  }

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải URL thanh toán. Vui lòng thử lại.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={(navState) => {
        if (navState.url.includes("vnp_TransactionStatus=00")) {
          Alert.alert("Thanh toán thành công!", "Cảm ơn bạn đã sử dụng VN PAY.", [
            {
              text: "OK",
              onPress: () => navigation.replace("VNPayPaymentScreen", { cartId, totalPrice }),
            },
          ]);
        } else if (navState.url.includes("failure")) {
          Alert.alert("Thanh toán thất bại", "Vui lòng thử lại.");
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  completedText: {
    fontSize: 16,
    color: "green",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default VNPayPaymentScreen;
