import React, { useEffect } from "react";
import { View, Text } from "react-native";
import axios from "axios";

const API_KEY =
  "AK_CS.601cafb0e37b11efa35d3bccdd557a34.qhX1xPUagr8IP1NcpGVIdyHl8tV9riYjqGwNUCebU1pGOSQapEt8V3UG9w6xam01OQOPwNLG";
const API_GET_PAID = "https://oauth.casso.vn/v2/transactions";

const OrdersScreen = () => {
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(API_GET_PAID, {
          headers: {
            Authorization: `apikey ${API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        const records = response.data?.data?.records || [];

        console.log("Full API Response:", response.data);
        console.log("Records:", records);

        records.forEach((record: any, index: number) => {
          console.log(`Record ${index + 1}:`, record);
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <View>
      <Text>Orders Screen</Text>
    </View>
  );
};

export default OrdersScreen;
