// app/(tabs)/_layout.tsx
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      edges={['top']}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: 'transparent',
            },
            default: {
              backgroundColor: Colors[colorScheme].background,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="group"
          
          options={{
            title: 'Group',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="users" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'User',
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="user" size={24} color={color} />
            ),
          }}
        />
     
    
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});