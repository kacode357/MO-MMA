import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomePos = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Clear tokens from AsyncStorage
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      
      // Navigate to Login screen
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error clearing tokens during logout:", error);
    }
  };

  const navigateToScreen = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>POS System</Text>
        <Text style={styles.subtitle}>
          Streamline your sales and management
        </Text>

        {/* Máy POS */}
        <View style={styles.posSection}>
          <TouchableOpacity
            style={styles.posButton}
            onPress={() => navigateToScreen("PosMachine")}
          >
            <Text style={styles.posButtonText}>Enter POS Machine</Text>
            <Text style={styles.posButtonDescription}>
              Start selling quickly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quản lý */}
        <View style={styles.managementSection}>
          <Text style={styles.managementTitle}>Management</Text>

          <View style={styles.managementButtonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCart]}
              onPress={() => navigateToScreen("Category")}
            >
              <Text style={styles.buttonText}>Category</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonProducts]}
              onPress={() => navigateToScreen("Foods")}
            >
              <Text style={styles.buttonText}>Foods</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonOrders]}
              onPress={() => navigateToScreen("Orders")}
            >
              <Text style={styles.buttonText}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonReports]}
              onPress={() => navigateToScreen("Dashboard")}
            >
              <Text style={styles.buttonText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonMyApplication]}
              onPress={() => navigateToScreen("MyLocation")}
            >
              <Text style={styles.buttonText}>My Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSettings]}
              onPress={() => navigateToScreen("Settings")}
            >
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  posSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  posButton: {
    width: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  posButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  posButtonDescription: {
    fontSize: 14,
    color: "#f9f9f9",
    marginTop: 10,
  },
  managementSection: {
    marginTop: 20,
  },
  managementTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  managementButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    width: "48%",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
    paddingVertical: 20,
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
    backgroundColor: "#FFD54F",
  },
  buttonOrders: {
    backgroundColor: "#29B6F6",
  },
  buttonReports: {
    backgroundColor: "#AB47BC",
  },
  buttonMyApplication: {
    backgroundColor: "#0adb40",
  },
  buttonSettings: {
    backgroundColor: "#FF7043",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutSection: {
    marginTop: 30,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomePos;
