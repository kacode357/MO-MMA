import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const PaymentSuccessScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Completed Successfully!</Text>
      <Text style={styles.message}>Thank you for your purchase.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("HomePos")}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#007bff" },
  message: { fontSize: 18, marginBottom: 30 },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: 200,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default PaymentSuccessScreen;
