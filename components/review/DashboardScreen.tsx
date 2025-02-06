import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { Text, Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import { getDashboardPayment } from "../../services/api"; // Đảm bảo đường dẫn chính xác

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardPayment();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Title>📊 Tổng quan thanh toán</Title>
          <Paragraph>🔹 Số đơn đã thanh toán: {dashboardData.totalPaidOrders}</Paragraph>
          <Paragraph>💰 Tổng doanh thu: {dashboardData.totalRevenue.toLocaleString()} VND</Paragraph>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Title>💳 Phương thức thanh toán</Title>
          {dashboardData.paymentMethodStats.map((method: any) => (
            <Paragraph key={method._id}>
              {method._id === "qr_code" ? "📱 QR Code" : "💵 Tiền mặt"}: {method.count} giao dịch
            </Paragraph>
          ))}
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Title>🛒 Đơn hàng gần đây</Title>
          {dashboardData.recentPaidOrders.map((order: any) => (
            <View key={order._id} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: "bold" }}>🆔 Mã đơn: {order.order_id}</Text>
              <Text>📅 Ngày: {new Date(order.createdAt).toLocaleDateString()}</Text>
              <Text>💰 Tổng tiền: {order.total_price.toLocaleString()} VND</Text>
              <Text>📝 Trạng thái: {order.status === "completed" ? "✅ Hoàn thành" : "⏳ Đang xử lý"}</Text>
              <Text>🍽️ Món ăn:</Text>
              {order.items.map((item: any) => (
                <Text key={item._id}>  - {item.food_id.name} x {item.quantity} ({item.price.toLocaleString()} VND)</Text>
              ))}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default DashboardScreen;
