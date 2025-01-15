import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PopularServices from "../Home/PopularServices";
import AllCate from "../Home/AllCate";

const HomeScreen = () => {
 
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const Id = await AsyncStorage.getItem("userId");
        console.log("Value:", token);
        console.log("Id:", Id);
       ;
      } catch (error) {
        console.log("Error reading AsyncStorage:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <AllCate/>
      <PopularServices />
    </View>
  );
};

export default HomeScreen;
