import { ThemeProvider } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      const navigateToAdmin = async () => {
        const userRole = await AsyncStorage.getItem('user_role');
        if (userRole === 'admin') {
          router.replace('/admin/admin'); 
        } else {
          router.replace('/(tabs)'); 
        }      
      };
      navigateToAdmin();
    }
  }, [loaded]);

  if (!loaded) {
    return null; 
  }

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin/admin" options={{ headerShown: false }} />
        <Stack.Screen name="purchase-screen" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}