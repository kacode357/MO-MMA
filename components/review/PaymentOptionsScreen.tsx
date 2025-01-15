import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Image, TouchableOpacity } from "react-native";
import { getCart } from "../../services/api";

type PaymentOptionsScreenProps = {
  route: { params: { cartId: string; totalPrice: number } };
  navigation: any;
};

type FoodDetails = {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
};

type CartItem = {
  foodId: FoodDetails;
  quantity: number;
  price: number;
};

type CartDetails = {
  _id: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
};

const PaymentOptionsScreen: React.FC<PaymentOptionsScreenProps> = ({ route, navigation }) => {
  const { cartId, totalPrice } = route.params;
  const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const cartData = await getCart();
        console.log(cartData);
        setCartDetails(cartData);
      } catch (error) {
        Alert.alert("Error", "Không thể tải thông tin giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cartId]);

  const handleCashPayment = () => {
    navigation.navigate("CashPaymentScreen", { cartId, totalPrice });
  };

  const handleVNPayPayment = () => {
    navigation.navigate("VNPayPaymentScreen", { cartId, totalPrice });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff7f50" />
        <Text>Đang tải thông tin giỏ hàng...</Text>
      </View>
    );
  }

  if (!cartDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không thể hiển thị thông tin giỏ hàng.</Text>
      </View>
    );
  }

  const formattedDate = new Date(cartDetails.createdAt).toLocaleString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết giỏ hàng</Text>
      <View style={styles.detailContainer}>
        {cartDetails.items.map((item) => (
          <View key={item.foodId._id} style={styles.itemRow}>
            <Image source={{ uri: item.foodId.image_url }} style={styles.image} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.foodId.name}</Text>
              <Text style={styles.itemDescription}>{item.foodId.description}</Text>
              <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price.toFixed(0)}đ</Text>
          </View>
        ))}
      </View>
      <Text style={styles.totalPrice}>Tổng cộng: {cartDetails.totalPrice.toFixed(0)}đ</Text>
      <Text style={styles.date}>Thời gian tạo: {formattedDate}</Text>
      <TouchableOpacity style={styles.button} onPress={handleCashPayment}>
        <Text style={styles.buttonText}>Thanh toán tiền mặt</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleVNPayPayment}>
        <Text style={styles.buttonText}>Thanh toán bằng VN PAY</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e65100",
    marginBottom: 20,
    textAlign: "center",
  },
  detailContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#e65100",
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#555",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff5722",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d84315",
    marginBottom: 10,
    textAlign: "center",
  },
  date: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff7043",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentOptionsScreen;
