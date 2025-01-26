import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { updatePaymentStatus } from "../../../services/api";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const CashScreen = ({ route }: any) => {
  const { order_id, amount, method, items, paymentId } = route.params;
  const [customerAmount, setCustomerAmount] = useState<string>(""); // Số tiền khách đưa
  const [changeAmount, setChangeAmount] = useState<number>(0); // Số tiền trả lại

  const handleAmountChange = (value: string) => {
    setCustomerAmount(value);

    const customerPaid = parseFloat(value);
    if (!isNaN(customerPaid) && customerPaid >= amount) {
      setChangeAmount(customerPaid - amount); // Tính tiền thừa
    } else {
      setChangeAmount(0); // Đặt tiền thừa là 0 nếu số tiền không đủ hoặc không hợp lệ
    }
  };

  const handleCompletePayment = async () => {
    const customerPaid = parseFloat(customerAmount);

    if (isNaN(customerPaid) || customerPaid < amount) {
      Alert.alert("Error", "The amount provided is insufficient.");
      return;
    }

    try {
      const paymentData = {
        status: "paid",
        method,
      };

      console.log("Updating payment status:", paymentData);
      const response = await updatePaymentStatus(paymentId, paymentData);
      console.log("Payment updated:", response);

      Alert.alert(
        "Success",
        `Payment completed successfully! Change: $${changeAmount.toFixed(2)}`
      );

      // Tạo và xuất file PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #007bff; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Payment Receipt</h1>
            <p>Order ID: ${order_id}</p>
            <p>Payment ID: ${paymentId}</p>
            <p>Payment Method: ${method}</p>
            <p>Amount: $${amount.toFixed(2)}</p>
            <p>Customer Paid: $${customerPaid.toFixed(2)}</p>
            <p>Change: $${changeAmount.toFixed(2)}</p>
            <table>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
              ${items
                .map(
                  (item: { food_id: { name: string }; quantity: number; price: number }) => `
                <tr>
                  <td>${item.food_id.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </table>
            <div class="summary">
              <p>Thank you for your purchase!</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log("PDF saved to:", uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("PDF saved", `PDF file has been saved to: ${uri}`);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      Alert.alert("Error", "An error occurred while completing the payment.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method: {method}</Text>
      <Text>Order ID: {order_id}</Text>
      <Text>Payment ID: {paymentId}</Text>
      <Text>Amount: ${amount.toFixed(2)}</Text>
      <Text>Thank you for choosing Cash Payment!</Text>
      <Text style={styles.subtitle}>Order Items:</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.food_id.name}</Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Customer Paid:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          keyboardType="numeric"
          value={customerAmount}
          onChangeText={handleAmountChange}
        />
        <Text style={styles.changeText}>
          Change: ${changeAmount.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCompletePayment}>
        <Text style={styles.buttonText}>Complete Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
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
  inputContainer: { marginTop: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  changeText: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default CashScreen;
