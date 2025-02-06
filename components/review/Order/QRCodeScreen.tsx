import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import axios from "axios";
import { updatePaymentStatus } from "../../../services/api";
import { generateAndSharePDF, formatCurrency } from "./ReceiptGenerator";

const BANK_ID = "970416"; 
const ACCOUNT_NO = "16697391";
const TEMPLATE = "compact";
const ACCOUNT_NAME = "Nguyen Van A"; 

const API_KEY =
  "AK_CS.601cafb0e37b11efa35d3bccdd557a34.qhX1xPUagr8IP1NcpGVIdyHl8tV9riYjqGwNUCebU1pGOSQapEt8V3UG9w6xam01OQOPwNLG";
const API_GET_PAID = "https://oauth.casso.vn/v2/transactions";

const QRCodeScreen = ({ route }: any) => {
  const { order_id, amount, method, items, paymentId } = route.params;
  const navigation: NavigationProp<any> = useNavigation();
  const [isPaid, setIsPaid] = useState(false);

  // Tạo URL QR Code từ VietQR
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=Order%20${order_id}&accountName=${encodeURIComponent(
    ACCOUNT_NAME
  )}`;

  // Cập nhật trạng thái thanh toán sau khi nhận tiền
  const updatePayment = async () => {
    try {
      const paymentData = { status: "paid", method };
      console.log("Updating payment status:", paymentData);
      await updatePaymentStatus(paymentId, paymentData);
      console.log("Payment updated successfully!");

      Alert.alert(
        "Payment Success",
        "Your payment has been received! Would you like to print the receipt?",
        [
          {
            text: "Print Receipt",
            onPress: () =>
              generateAndSharePDF(order_id, paymentId, method, amount, amount, 0, items),
          },
          {
            text: "No, Thanks",
            style: "cancel",
            onPress: () => navigation.navigate("PaymentSuccessScreen"),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
      Alert.alert("Error", "An error occurred while updating the payment.");
    }
  };

  // Kiểm tra giao dịch mỗi 15 giây
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(API_GET_PAID, {
          headers: {
            Authorization: `apikey ${API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response:", response.data);

        const records = response.data?.data?.records || [];
        if (!Array.isArray(records)) {
          console.error("Invalid response format: records is not an array", records);
          return;
        }

        console.log("Checking Payment Status...");
        console.log("Records:", records);

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
        console.error("Error fetching payment status:", error);
      }
    };

    const interval = setInterval(() => {
      if (!isPaid) {
        checkPaymentStatus();
      } else {
        clearInterval(interval);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isPaid]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method: {method}</Text>
      <Text>Order ID: {order_id}</Text>
      <Text>Amount: {formatCurrency(amount)}</Text>
      <Text>Please scan the QR Code to complete your payment.</Text>

      {/* Hiển thị mã QR */}
      <Image source={{ uri: qrUrl }} style={styles.qrImage} />

      {/* Hiển thị danh sách sản phẩm */}
      <Text style={styles.subtitle}>Order Items</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={items}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.food_id?.name || "Unknown"}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
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
  listContainer: {
    alignSelf: "stretch",
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
