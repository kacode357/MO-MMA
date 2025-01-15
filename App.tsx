import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { OPEN_SANS_REGULAR } from "./utils/const";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigation from "./components/navigation/app.navigation";
import Toast from "react-native-toast-message";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    [OPEN_SANS_REGULAR]: require("./assets/fonts/OpenSans-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
        <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
        <PaperProvider>
          <NavigationContainer>
            <AppNavigation />
            <Toast />
          </NavigationContainer>
        </PaperProvider>
    </SafeAreaProvider>
  );
}
