import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  getApiFood,
  getApiOrders,
  increaseOrderItemQuantity,
  decreaseOrderItemQuantity,
} from "../../services/api";

interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

const ProductsScreen = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchFoods = async () => {
    try {
      const searchCondition = { keyword: "", is_delete: false };
      const pageInfo = { pageNum: 1, pageSize: 10 };
      const result = await getApiFood(searchCondition, pageInfo);

      const mappedFoods = result.pageData.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        quantity: 0,
      }));

      return mappedFoods;
    } catch (err) {
      setError("Failed to load products");
      return [];
    }
  };

  const fetchOrderData = async () => {
    try {
      const result = await getApiOrders();
      const orderItems = result.items;

      const orderMap: { [key: string]: number } = {};
      orderItems.forEach((item: any) => {
        orderMap[item.food_id._id] = item.quantity;
      });

      setTotalPrice(result.total_price); // Set total price from order
      setTotalItems(
        orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      ); // Calculate total items
      return orderMap;
    } catch (err) {
      console.error("Failed to fetch order data");
      return {};
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsData, orderData] = await Promise.all([
        fetchFoods(),
        fetchOrderData(),
      ]);

      const updatedFoods = foodsData.map((food: Food) => ({
        ...food,
        quantity: orderData[food.id] || 0,
      }));

      setFoods(updatedFoods);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(); // Reload data
    setRefreshing(false);
  };

  const handleIncrease = async (foodId: string) => {
    try {
      const response = await increaseOrderItemQuantity(foodId);
      setFoods((prevFoods) =>
        prevFoods.map((food) => {
          const orderItem = response.items.find(
            (item: any) => item.food_id._id === food.id
          );
          return orderItem
            ? { ...food, quantity: orderItem.quantity }
            : { ...food, quantity: 0 };
        })
      );
      setTotalPrice(response.total_price);
      setTotalItems(
        response.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      );
    } catch (err) {
      alert("Failed to increase quantity.");
    }
  };

  const handleDecrease = async (foodId: string, quantity: number) => {
    if (quantity === 0) return; // Không gửi API nếu số lượng là 0

    try {
      const response = await decreaseOrderItemQuantity(foodId);

      setFoods((prevFoods) =>
        prevFoods.map((food) => {
          const orderItem = response.items.find(
            (item: any) => item.food_id._id === food.id
          );
          return orderItem
            ? { ...food, quantity: orderItem.quantity }
            : { ...food, quantity: 0 };
        })
      );
      setTotalPrice(response.total_price);
      setTotalItems(
        response.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      );
    } catch (err) {
      alert("Failed to decrease quantity.");
    }
  };

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.error}>
        <Text>{error}</Text>
      </View>
    );
  }

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
                  item.quantity === 0 && styles.disabledButton, // Thêm style khi nút bị vô hiệu hóa
                ]}
                onPress={() => handleDecrease(item.id, item.quantity)}
                disabled={item.quantity === 0} // Vô hiệu hóa nút nếu quantity = 0
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quantity: {
    fontSize: 14,
    color: "#777",
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc", // Màu xám khi nút bị vô hiệu hóa
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  summary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  placeOrderButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProductsScreen;
