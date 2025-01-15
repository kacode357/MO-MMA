import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getApiFood, addToCart, getCart } from "../../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import CartSummary from "./CartSummary";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  original_price: number;
  description: string;
  image_url: string;
  location: string;
  distance: string;
}

interface CartData {
  totalItems: number;
  totalPrice: number;
  items: Array<{ foodId: string; quantity: number }>;
}

interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const ProductsScreen: React.FC = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartData | null>(null);

  // Fetch data and cart when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData(1, true);
      fetchCart();
    }, [searchQuery])
  );

  const fetchData = async (pageNum: number, resetData: boolean = false) => {
    try {
      if (resetData) setLoading(true);
      const response = await getApiFood(
        { keyword: searchQuery, is_delete: false },
        { pageNum, pageSize: pageInfo.pageSize }
      );

      const { pageData, pageInfo: newPageInfo } = response;

      setData((prevData) => (resetData ? pageData : [...prevData, ...pageData]));
      setPageInfo(newPageInfo);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCart = async () => {
    try {
      const cartData = await getCart(); // Lấy lại dữ liệu giỏ hàng
      setCart(cartData); // Lưu dữ liệu giỏ hàng vào state
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const handleAddToCart = async (foodId: string) => {
    try {
      await addToCart(foodId, 1); // Thêm sản phẩm vào giỏ hàng
     
      fetchCart(); // Cập nhật giỏ hàng sau khi thêm sản phẩm
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(1, true);
    fetchCart();
  };

  const loadMoreData = () => {
    if (pageInfo.pageNum < pageInfo.totalPages && !loading) {
      fetchData(pageInfo.pageNum + 1);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchData(1, true);
  };

  if (loading && data.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <MaterialIcons name="clear" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.discountedPrice}>{item.price}đ</Text>
                <TouchableOpacity onPress={() => handleAddToCart(item._id)} style={styles.addButton}>
                  <MaterialIcons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          pageInfo.pageNum < pageInfo.totalPages ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FF5733" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#FF5733"]}
          />
        }
      />
      <CartSummary cart={cart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#DDDDDD",
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  category: {
    fontSize: 14,
    color: "#4A628A",
    marginVertical: 5,
  },
  description: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5733",
  },
  addButton: {
    backgroundColor: "#FF5733",
    borderRadius: 20,
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductsScreen;
