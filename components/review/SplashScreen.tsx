import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
const SplashScreen: React.FC = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("HomePos");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>POS System</Text>
      <Text style={styles.subtitle}>Simplify your business</Text>
      <ActivityIndicator size="large" color="#4A628A" style={styles.loader} />
    </View>
  );
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
