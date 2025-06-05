import PremiumGroupContent from '@/components/PremiumGroupContent';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

const GroupScreen = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Theme colors
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  // Lấy role từ AsyncStorage (có thể thay bằng API hoặc context)
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('user_role');
        console.log('User role:', role);
        setUserRole(role);
      } catch (err: any) {
        console.error('Error fetching user role:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Hiển thị khi đang tải role
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.text, { color: colors.text }]}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  // UI cho Premium user
  if (userRole === 'premium') {
    return <PremiumGroupContent colors={colors} />;
  }

  // UI quảng cáo nâng cấp Premium
  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Nâng cấp lên Premium để tham gia nhóm!
      </ThemedText>
      <PremiumUpgrade />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 8 },
});

export default GroupScreen;