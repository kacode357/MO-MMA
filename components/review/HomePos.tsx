import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";


const { width, height } = Dimensions.get("window");

const HomePos = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  const navigateToScreen = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POS System</Text>
      <Text style={styles.subtitle}>Simplify your sales and transactions</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonProducts]}
          onPress={() => navigateToScreen("Products")}
        >
          <Text style={styles.buttonText}>Products</Text>
          <Text style={styles.buttonDescription}>View and manage items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonCart]}
          onPress={() => navigateToScreen("Cart")}
        >
          <Text style={styles.buttonText}>Cart</Text>
          <Text style={styles.buttonDescription}>Check out items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOrders]}
          onPress={() => navigateToScreen("Orders")}
        >
          <Text style={styles.buttonText}>Orders</Text>
          <Text style={styles.buttonDescription}>Track your orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPayment]}
          onPress={() => navigateToScreen("Payment")}
        >
          <Text style={styles.buttonText}>Payment</Text>
          <Text style={styles.buttonDescription}>Process transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonReports]}
          onPress={() => navigateToScreen("Reports")}
        >
          <Text style={styles.buttonText}>Reports</Text>
          <Text style={styles.buttonDescription}>View sales data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSettings]}
          onPress={() => navigateToScreen("Settings")}
        >
          <Text style={styles.buttonText}>Settings</Text>
          <Text style={styles.buttonDescription}>Configure system</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#F0F4F8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  button: {
    width: width * 0.45,
    height: height * 0.15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonProducts: {
    backgroundColor: "#FF6F61",
  },
  buttonCart: {
    backgroundColor: "#4CAF50",
  },
  buttonOrders: {
    backgroundColor: "#FFD54F",
  },
  buttonPayment: {
    backgroundColor: "#29B6F6",
  },
  buttonReports: {
    backgroundColor: "#AB47BC",
  },
  buttonSettings: {
    backgroundColor: "#FF7043",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonDescription: {
    fontSize: 12,
    color: "#f9f9f9",
    marginTop: 5,
    textAlign: "center",
  },
});

export default HomePos;
