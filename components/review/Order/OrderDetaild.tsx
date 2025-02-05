import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getApiOrders, processPayment } from "../../../services/api";

const OrderDetails = () => {

  const navigation: NavigationProp<RootStackParamList> = useNavigation();


  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  // Hàm định dạng tiền tệ VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getApiOrders();
      if (response) {
        setOrderDetails(response);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    const paymentData = {
      order_id: orderDetails._id,
      amount: orderDetails.total_price,
      method: paymentMethod.toLowerCase(),
      items: orderDetails.items,
    };

    try {
      // Loại bỏ `items` khi gửi API
      const { items, ...paymentDataWithoutItems } = paymentData;
      console.log("Payment data:", paymentDataWithoutItems);

      // Gửi yêu cầu thanh toán
      const response = await processPayment(paymentDataWithoutItems);
      console.log("Payment response:", response);
      setPaymentId(response._id);

      if (response) {
        const navigationData = { ...paymentData, paymentId: response.payment._id };
        console.log("Navigation data:", navigationData);

        if (paymentMethod === "cash") {
          navigation.navigate("CashScreen", navigationData);
        } else if (paymentMethod === "qr_code") {
          navigation.navigate("QRCodeScreen", navigationData);
        }
      } else {
        alert("Payment failed: " + response.message);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred while processing the payment. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.orderInfo}>
        <Text style={styles.detail}>Order ID: {orderDetails._id}</Text>
        <Text style={styles.detail}>Total Items: {orderDetails.total_items}</Text>
        <Text style={styles.detail}>Total Price: {formatCurrency(orderDetails.total_price)}</Text>
        <Text style={styles.detail}>Status: {orderDetails.status}</Text>
      </View>

      <FlatList
        data={orderDetails.items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.food_id.name}</Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        )}
        style={styles.itemList}
      />

      <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentLabel}>Choose Payment Method:</Text>
        <Picker selectedValue={paymentMethod} style={styles.picker} onValueChange={(itemValue) => setPaymentMethod(itemValue)}>
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="QR Code" value="qr_code" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  orderInfo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  itemList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 2,
  },
  itemQuantity: {
    fontSize: 16,
    textAlign: "center",
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default OrderDetails;
