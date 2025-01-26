import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { getApiFood, getApiOrders, increaseOrderItemQuantity, decreaseOrderItemQuantity } from "../../services/api";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import styles from "../../styles/PosMachineStyles";

interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

const PosMachine = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  // Fetch danh sách sản phẩm
  const fetchFoods = async () => {
    try {
      const searchCondition = { keyword: "", is_delete: false };
      const pageInfo = { pageNum: 1, pageSize: 10 };
      const result = await getApiFood(searchCondition, pageInfo);
      return result.pageData.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        quantity: 0,
      }));
    } catch {
      setError("Failed to load products");
      return [];
    }
  };

  // Fetch thông tin đơn hàng
  const fetchOrderData = async () => {
    try {
      const result = await getApiOrders();
  
      if (!result || !result.items || result.items.length === 0) {
        console.log("No order data found");
        // Trường hợp không có dữ liệu
        setOrderId(null);
        setTotalPrice(0);
        setTotalItems(0);
        return {};
      }
  
      // Trường hợp có dữ liệu
      setOrderId(result._id);
      setTotalPrice(result.total_price);
      setTotalItems(result.total_items);
  
      // Tạo map cho các sản phẩm trong đơn hàng
      const orderMap: { [key: string]: number } = {};
      result.items.forEach((item: any) => {
        orderMap[item.food_id._id] = item.quantity;
      });
  
      return orderMap;
    } catch (error) {
      setError("Failed to load order data");
      console.error("Error fetching order data:", error);
      return {};
    }
  };
  

  // Kết hợp dữ liệu sản phẩm và đơn hàng
  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsData, orderData] = await Promise.all([
        fetchFoods(),
        fetchOrderData(),
      ]);
      setFoods(
        foodsData.map((food: Food) => ({
          ...food,
          quantity: orderData[food.id] || 0,
        }))
      );
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật số lượng sản phẩm (tăng/giảm)
  const updateOrder = (updatedResponse: any) => {
    setFoods((prevFoods) =>
      prevFoods.map((food) => ({
        ...food,
        quantity:
          updatedResponse.items.find((item: any) => item.food_id === food.id)
            ?.quantity || food.quantity,
      }))
    );
    setTotalPrice(updatedResponse.total_price);
    setTotalItems(
      updatedResponse.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    );
  };

  const handleIncrease = async (foodId: string) => {
    try {
      const response = await increaseOrderItemQuantity(foodId);
      updateOrder(response);
      if (!orderId) setOrderId(response._id); // Cập nhật orderId nếu chưa có
    } catch {
      Alert.alert("Error", "Failed to increase quantity.");
    }
  };

  const handleDecrease = async (foodId: string, quantity: number) => {
    if (quantity === 0) return; // Không giảm nếu số lượng đã bằng 0
    try {
      const response = await decreaseOrderItemQuantity(foodId);
  
      // Cập nhật danh sách sản phẩm
      setFoods((prevFoods) =>
        prevFoods.map((food) => {
          const orderItem = response.items.find(
            (item: any) => item.food_id === food.id
          );
          return {
            ...food,
            quantity: orderItem ? orderItem.quantity : 0, // Nếu không tìm thấy trong đơn hàng, đặt số lượng = 0
          };
        })
      );
  
      // Cập nhật tổng giá và tổng số lượng
      setTotalPrice(response.total_price);
      setTotalItems(
        response.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      );
    } catch {
      Alert.alert("Error", "Failed to decrease quantity.");
    }
  };

  const handlePlaceOrder = () => {
    if (!orderId || totalItems === 0) {
      Alert.alert("Error", "The cart is empty.");
      return;
    }
    navigation.navigate("OrderDetails", { orderId });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Hiển thị loader khi đang tải
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <View style={styles.error}>
        <Text>{error}</Text>
      </View>
    );
  }

  // Giao diện chính
  return (
    <View style={styles.container}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.quantity}>x {item.quantity}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  item.quantity === 0 && styles.disabledButton,
                ]}
                onPress={() => handleDecrease(item.id, item.quantity)}
                disabled={item.quantity === 0}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleIncrease(item.id)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Items:</Text>
          <Text style={styles.summaryValue}>{totalItems}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Price:</Text>
          <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PosMachine;
