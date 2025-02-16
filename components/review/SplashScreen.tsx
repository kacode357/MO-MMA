import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { refreshToken } from "../../services/api";  
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen: React.FC = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTokens = async () => {
      try {
        const access_token = await AsyncStorage.getItem("access_token");
        const refresh_token = await AsyncStorage.getItem("refresh_token");

        // If no tokens, navigate to Login screen
        if (!access_token || !refresh_token) {
          setLoading(false);
          navigation.navigate("Login");
          return;
        }

        // Attempt to refresh the tokens
        const response = await refreshToken({ access_token, refresh_token });

        // Assuming response contains the new access token
        if (response?.access_token) {
          // Save the new access token if it exists
          await AsyncStorage.setItem("access_token", response.access_token);
          setLoading(false);
          navigation.navigate("HomePos");
        } else {
          setLoading(false);
          navigation.navigate("Login");
        }
      } catch (error) {
        setLoading(false);
        console.error("Error refreshing token:", error);
        navigation.navigate("Login");
      }
    };

    checkTokens();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>POS System</Text>
        <Text style={styles.subtitle}>Simplify your business</Text>
        <ActivityIndicator size="large" color="#4A628A" style={styles.loader} />
      </View>
    );
  }

  return null; // Return nothing while loading
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
