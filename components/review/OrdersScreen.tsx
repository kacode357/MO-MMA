import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator, Searchbar } from "react-native-paper";
import { getDashboardOrders } from "../../services/api"; // Đảm bảo đường dẫn đúng

// Định nghĩa kiểu dữ liệu cho đơn hàng
interface OrderItem {
  order_id: string;
  createdAt: string;
  total_price: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageInfo, setPageInfo] = useState({ pageNum: 1, pageSize: 10, totalPages: 1 });

  // Hàm lấy danh sách đơn hàng
  const fetchOrders = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getDashboardOrders(
        { status: "completed", keyword: searchQuery },
        { pageNum: pageInfo.pageNum, pageSize: pageInfo.pageSize }
      );

      console.log("Danh sách đơn hàng:", response);

      if (isRefreshing) {
        setOrders(response.pageData);
      } else {
        setOrders((prevOrders) => [...prevOrders, ...response.pageData]);
      }

      setPageInfo((prev) => ({
        ...prev,
        totalPages: response.pageInfo.totalPages,
        totalOrders: response.pageInfo.totalOrders,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [searchQuery]);

  // Làm mới dữ liệu (kéo xuống)
  const onRefresh = useCallback(async () => {
    setPageInfo((prev) => ({ ...prev, pageNum: 1 }));
    await fetchOrders(true);
  }, []);

  // Tải thêm dữ liệu khi cuộn xuống cuối danh sách
  const loadMoreOrders = () => {
    if (pageInfo.pageNum < pageInfo.totalPages) {
      setPageInfo((prev) => ({ ...prev, pageNum: prev.pageNum + 1 }));
      fetchOrders();
    }
  };

  // Hiển thị mỗi đơn hàng (có khai báo kiểu dữ liệu rõ ràng)
  const renderItem = ({ item }: { item: OrderItem }) => (
    <Card key={item.order_id} style={{ marginBottom: 16 }}>
      <Card.Content>
        <Title>🆔 Đơn hàng: {item.order_id}</Title>
        <Paragraph>📅 Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}</Paragraph>
        <Paragraph>💰 Tổng tiền: {item.total_price.toLocaleString()} VND</Paragraph>
        <Paragraph>📝 Trạng thái: {item.status === "completed" ? "✅ Hoàn thành" : "⏳ Đang xử lý"}</Paragraph>
        <Paragraph>🍽️ Món ăn:</Paragraph>
        {item.items.map((food, index) => (
          <Paragraph key={index}>
            - {food.name} x {food.quantity} ({food.price.toLocaleString()} VND)
          </Paragraph>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Thanh tìm kiếm */}
      <Searchbar
        placeholder="Tìm kiếm đơn hàng..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ marginBottom: 16 }}
      />

      {/* Danh sách đơn hàng */}
      {loading && orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={{ marginTop: 10 }}>Đang tải danh sách đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.order_id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.2} // Load thêm khi cuộn đến 80% danh sách
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Không có đơn hàng nào.</Text>}
        />
      )}
    </View>
  );
};

export default OrdersScreen;
