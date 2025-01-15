import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";

const Profile = () => {
  const navigation: NavigationProp<any> = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); 
      navigation.navigate("Login"); 
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

  const menuItems = [
    { title: "Your profile", icon: <Ionicons name="person-outline" size={24} color="#000" />, screen: "YourProfile" },
    // { title: "Manage Address", icon: <Ionicons name="location-outline" size={24} color="#000" />, screen: "ManageAddress" },
    // { title: "Payment Methods", icon: <MaterialIcons name="payment" size={24} color="#000" />, screen: "PaymentMethods" },
    // { title: "My Bookings", icon: <Ionicons name="calendar-outline" size={24} color="#000" />, screen: "MyBookings" },
    // { title: "My Wallet", icon: <FontAwesome5 name="wallet" size={24} color="#000" />, screen: "MyWallet" },
    // { title: "Settings", icon: <Ionicons name="settings-outline" size={24} color="#000" />, screen: "Settings" },
    // { title: "Help Center", icon: <Ionicons name="help-circle-outline" size={24} color="#000" />, screen: "HelpCenter" },
    // { title: "Privacy Policy", icon: <Ionicons name="lock-closed-outline" size={24} color="#000" />, screen: "PrivacyPolicy" },
    { title: "Logout", icon: <Ionicons name="log-out-outline" size={24} color="red" />, action: handleLogout }, // Mục Logout
  ];

  return (
    <ScrollView style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={
            item.action
              ? item.action
              : () => navigation.navigate(item.screen) 
          }
        >
          <View style={styles.iconContainer}>{item.icon}</View>
          <Text style={[styles.menuText, item.title === "Logout" ? { color: "red" } : null]}>
            {item.title}
          </Text>
          {item.title !== "Logout" && <Ionicons name="chevron-forward-outline" size={24} color="#000" />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Profile;

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});
