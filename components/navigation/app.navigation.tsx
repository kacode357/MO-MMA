import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomePos from "../review/HomePos";
import SplashScreen from "../review/SplashScreen";
import OrdersScreen from "../review/OrdersScreen";
import PaymentOptionsScreen from "../review/PaymentOptionsScreen";
import DashboardScreen from "../review/DashboardScreen";
import SettingsScreen from "../review/SettingsScreen";
import CartDetailsScreen from "../review/CartDetailsScreen";
import CashPaymentScreen from "../review/CashPaymentScreen";
import VNPayPaymentScreen from "../review/VNPayPaymentScreen";
import Login from "../review/Login";
import PosMachine from "../review/PosMachine";
import CategoryScreen from "../review/Category/CategoryScreen";
import FoodsScreen from "../review/Foods/FoodsScreen";
import OrderDetails from "../review/Order/OrderDetaild";
import CashScreen from "../review/Order/CashScreen";
import QRCodeScreen from "../review/Order/QRCodeScreen";
import PaymentSuccessScreen from "../review/Order/PaymentSuccessScreen";
import MyLocation from "../review/MyLocation";

// Root Stack Navigator
const AppNavigation = () => {
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  return (
    <RootStack.Navigator >
        <RootStack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }}/>
       <RootStack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
    
     
      <RootStack.Screen name="HomePos" component={HomePos} options={{ headerShown: false }}/>
    
    
      <RootStack.Screen name="Orders" component={OrdersScreen} />
      <RootStack.Screen name="PaymentOptionsScreen" component={PaymentOptionsScreen} options={{ title: "Phương thức thanh toán" }} />
      <RootStack.Screen name="CashPaymentScreen" component={CashPaymentScreen} options={{ title: "Thanh toán tiền mặt" }} />
      <RootStack.Screen name="VNPayPaymentScreen" component={VNPayPaymentScreen} options={{ title: "Thanh toán VN PAY" }} />
      <RootStack.Screen name="Dashboard" component={DashboardScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="CartDetails" component={CartDetailsScreen} />
      <RootStack.Screen name="PosMachine" component={PosMachine} />
      <RootStack.Screen name="Category" component={CategoryScreen} />
      <RootStack.Screen name="Foods" component={FoodsScreen} />
      <RootStack.Screen name="OrderDetails" component={OrderDetails} />
      <RootStack.Screen name="CashScreen" component={CashScreen} />
      <RootStack.Screen name="QRCodeScreen" component={QRCodeScreen} />
      <RootStack.Screen name="MyLocation" component={MyLocation} />
      <RootStack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen}  options={{ headerShown: false }}/>
      

    </RootStack.Navigator>
  );
};

export default AppNavigation;
