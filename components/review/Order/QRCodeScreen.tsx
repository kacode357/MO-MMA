  import React, { useEffect, useState } from "react";
  import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
  import { useNavigation, NavigationProp } from "@react-navigation/native";
  import axios from "axios";
  import { updatePaymentStatus } from "../../../services/api"; // Import API cập nhật thanh toán

  const BANK_ID = "970416"; // Mã ngân hàng ACB
  const ACCOUNT_NO = "16697391"; // Số tài khoản nhận tiền
  const TEMPLATE = "compact"; // Template QR
  const ACCOUNT_NAME = "Nguyen Van A"; // Tên chủ tài khoản

  const API_KEY =
    "AK_CS.601cafb0e37b11efa35d3bccdd557a34.qhX1xPUagr8IP1NcpGVIdyHl8tV9riYjqGwNUCebU1pGOSQapEt8V3UG9w6xam01OQOPwNLG";
  const API_GET_PAID = "https://oauth.casso.vn/v2/transactions";

  const QRCodeScreen = ({ route }: any) => {
    const { order_id, amount, method, items, paymentId } = route.params;
    console.log("Order Items:", items);

    const navigation: NavigationProp<any> = useNavigation();
    const [isPaid, setIsPaid] = useState(false);

    // Hàm định dạng tiền tệ VND
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Tạo URL QR Code từ VietQR
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=Order%20${order_id}&accountName=${encodeURIComponent(
      ACCOUNT_NAME
    )}`;

    // Hàm cập nhật trạng thái thanh toán sau khi nhận tiền thành công
    const updatePayment = async () => {
      try {
        const paymentData = {
          status: "paid",
          method,
        };

        console.log("Updating payment status:", paymentData);
        const response = await updatePaymentStatus(paymentId, paymentData);
        console.log("Payment updated:", response);

        Alert.alert("Payment Success", "Your payment has been received!");
        navigation.navigate("PaymentSuccessScreen"); // Chuyển sang trang xác nhận thanh toán
      } catch (error) {
        console.error("Error updating payment status:", error);
        Alert.alert("Error", "An error occurred while updating the payment.");
      }
    };

    // Kiểm tra giao dịch cứ mỗi 3 giây
    useEffect(() => {
      const checkPaymentStatus = async () => {
        try {
          const response = await axios.get(API_GET_PAID, {
            headers: {
              Authorization: `apikey ${API_KEY}`,
              "Content-Type": "application/json",
            },
          });

          console.log("API Response:", response.data); // Log dữ liệu API

          // Lấy dữ liệu giao dịch từ API (đúng cấu trúc)
          const records = response.data?.data?.records || [];

          if (!Array.isArray(records)) {
            console.error(
              "Invalid response format: records is not an array",
              records
            );
            return;
          }

          console.log("Checking Payment Status...");
          console.log("Records:", records);

          // Kiểm tra giao dịch hợp lệ
          const paidTransaction = records.find(
            (transaction: any) =>
              transaction.bankSubAccId === ACCOUNT_NO &&
              transaction.amount === amount &&
              transaction.description.includes(`Order ${order_id}`)
          );

          if (paidTransaction) {
            setIsPaid(true);
            updatePayment();
          }
        } catch (error) {
          // Xử lý lỗi khi gọi API
        }
      };

      const interval = setInterval(() => {
        if (!isPaid) {
          checkPaymentStatus();
        } else {
          clearInterval(interval); // Dừng kiểm tra nếu đã thanh toán
        }
      }, 15000);

      return () => clearInterval(interval); // Cleanup khi component bị unmount
    }, [isPaid]);

    return (
      <View style={styles.container}>
      <Text style={styles.title}>Payment Method: {method}</Text>
      <Text>Order ID: {order_id}</Text>
      <Text>Amount: {formatCurrency(amount)}</Text>
      <Text>Please scan the QR Code to complete your payment.</Text>
  
      {/* Hiển thị mã QR */}
      <Image source={{ uri: qrUrl }} style={styles.qrImage} />
      {/* Bọc FlatList trong View mới */}
      <Text style={styles.subtitle}>Order Items</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={items}
          keyExtractor={(item) => item._id.toString()} // Đảm bảo item._id là string
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.food_id?.name || "Unknown"}
              </Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
      alignItems: "center",
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    subtitle: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
    qrImage: { width: 200, height: 200, marginVertical: 20 },
  
    // Thêm style mới để giữ FlatList không bị căn giữa
    listContainer: {
      alignSelf: "stretch", // Mở rộng danh sách ra toàn bộ chiều ngang
      marginTop: 10,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    itemName: { fontSize: 16, flex: 2 },
    itemQuantity: { fontSize: 16, textAlign: "center", flex: 1 },
    itemPrice: { fontSize: 16, textAlign: "right", flex: 1 },
  });
  
  export default QRCodeScreen;
