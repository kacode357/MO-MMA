import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
interface CartData {
  totalItems: number;
  totalPrice: number;
  items: Array<{ foodId: string; quantity: number }>;
}

interface CartSummaryProps {
  cart: CartData | null;
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart }) => {
    const navigation: NavigationProp<RootStackParamList> = useNavigation();
  
    if (!cart || cart.totalItems === 0) {
      return null;
    }
  
    return (
      <View style={styles.cartContainer}>
        <Text style={styles.cartText}>{cart.totalItems} items selected</Text>
        <Text style={styles.cartPrice}>{cart.totalPrice}đ</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartDetails', { cart })}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };
const styles = StyleSheet.create({
  cartContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    padding: 15,
  },
  cartText: {
    color: "#FFF",
    fontSize: 16,
  },
  cartPrice: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartButton: {
    backgroundColor: "#FF5733",
    borderRadius: 20,
    padding: 10,
  },
});

export default CartSummary;
