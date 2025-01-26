import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const QRCodeScreen = ({ route }: any) => {
  const { order_id, amount, method, items } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Method: {method}</Text>
      <Text>Order ID: {order_id}</Text>
      <Text>Amount: ${amount.toFixed(2)}</Text>
      <Text>Please scan the QR Code to complete your payment.</Text>
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
});

export default QRCodeScreen;
