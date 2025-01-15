import React, { useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Alert, TextInput, Keyboard } from "react-native";
import styles from "../../styles/CartDetailsScreenStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateCart, getCart, deleteFromCart, clearCart } from "../../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
type FoodItem = {
  foodId: {
    _id: string;
    name: string;
    category: string;
    price?: number;
    description: string;
    image_url: string;
  };
  quantity: number;
  price?: number;
};

type CartData = {
  _id: string;
  items: FoodItem[];
  totalPrice: number;
  totalItems: number;
  status: string;
};

type RootStackParamList = {
  CartDetails: { cart: CartData };
  PaymentOptionsScreen: { cartId: string; totalPrice: number };
};

type Props = NativeStackScreenProps<RootStackParamList, "CartDetails">;

const CartDetailsScreen: React.FC<Props> = ({ route }) => {
  const [cart, setCart] = useState(route.params.cart);
  const [editingQuantity, setEditingQuantity] = useState<{ [key: string]: string }>({});
  const navigation : NavigationProp<RootStackParamList> = useNavigation();
  const handleUpdateQuantity = async (foodId: string, newQuantity: number) => {
    try {
      await updateCart(foodId, newQuantity);
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart:", error);
      Alert.alert("Error", "Failed to update cart. Please try again.");
    }
  };

  const handleDeleteFromCart = async (foodId: string) => {
    try {
      await deleteFromCart(foodId);
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error deleting from cart:", error);
      Alert.alert("Error", "Failed to delete item from cart. Please try again.");
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      "Confirm Clear Cart",
      "Are you sure you want to clear the entire cart?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await clearCart();
              const updatedCart = await getCart();
              setCart(updatedCart);
            } catch (error) {
              console.error("Error clearing cart:", error);
              Alert.alert("Error", "Failed to clear cart. Please try again.");
            }
          },
        },
      ]
    );
  };
  

  const handleQuantityChange = (foodId: string, value: string) => {
    setEditingQuantity((prev) => ({ ...prev, [foodId]: value }));
  };

  const handleQuantityBlur = async (foodId: string) => {
    const newQuantity = parseInt(editingQuantity[foodId], 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      await handleUpdateQuantity(foodId, newQuantity);
    } else {
      Alert.alert("Invalid Input", "Quantity must be a positive number.");
    }
    setEditingQuantity((prev) => {
      const updated = { ...prev };
      delete updated[foodId];
      return updated;
    });
    Keyboard.dismiss();
  };
  const handleCheckout = () => {
    navigation.navigate("PaymentOptionsScreen", { cartId: cart._id, totalPrice: cart.totalPrice });
  };
  const renderItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => handleDeleteFromCart(item.foodId._id)}
      >
        <MaterialIcons name="delete" size={20} color="#FF5733" />
      </TouchableOpacity>
      <Image
        source={{ uri: item.foodId.image_url || "https://via.placeholder.com/80" }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.foodId.name || "Unknown Item"}</Text>
        <Text style={styles.category}>Category: {item.foodId.category || "N/A"}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.foodId.description || "No description available."}
        </Text>
        <View style={styles.priceQuantityContainer}>
          <Text style={styles.price}>
            {item.foodId.price ? `${item.foodId.price.toFixed(0)}đ` : "N/A"}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.foodId._id, item.quantity - 1)}
            >
              <MaterialIcons name="remove" size={16} color="#FF5733" />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={editingQuantity[item.foodId._id] || item.quantity.toString()}
              keyboardType="numeric"
              onChangeText={(value) => handleQuantityChange(item.foodId._id, value)}
              onBlur={() => handleQuantityBlur(item.foodId._id)}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.foodId._id, item.quantity + 1)}
            >
              <MaterialIcons name="add" size={16} color="#FF5733" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.foodId._id}
        contentContainerStyle={styles.list}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total Items: {cart.totalItems}</Text>
        <Text style={styles.summaryText}>
          Total Price: {cart.totalPrice ? `${cart.totalPrice.toFixed(0)}đ` : "N/A"}
        </Text>
        <TouchableOpacity style={styles.clearCartButton} onPress={handleClearCart}>
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </TouchableOpacity>
        {/* Nút Thanh toán */}
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default CartDetailsScreen;
