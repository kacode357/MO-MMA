import PremiumUpgrade from '@/components/PremiumUpgrade';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CheckLogin from '../CheckLogin';

const User = () => {
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tổng hợp cho cả kiểm tra token và lấy role
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [role, setRole] = useState<string | null>(null); // Lưu role từ AsyncStorage

  // Lấy màu từ theme
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const listItemBackground = useThemeColor({}, 'background');
  const buttonBackground = useThemeColor({}, 'tint');

  // Kiểm tra token và lấy role từ AsyncStorage đồng bộ
  const initializeUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setRole(null);
        return;
      }

      setIsAuthenticated(true);
      const storedRole = await AsyncStorage.getItem('user_role'); // Giả định role được lưu với key 'user_role'
      setRole(storedRole);
    } catch (error) {
      console.error('Lỗi khi khởi tạo người dùng:', error);
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      initializeUser();
    }, [initializeUser])
  );

  // Xử lý đăng xuất
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_role'); // Xóa role khi đăng xuất
      router.replace('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText style={{ color: textColor }}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return <CheckLogin />;
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Hiển thị PremiumUpgrade nếu role là "user" */}
      {role === 'user' && <PremiumUpgrade />}
      {/* Hồ sơ */}
      <TouchableOpacity
        style={[styles.listItem, { backgroundColor: listItemBackground, borderBottomColor: borderColor }]}
        onPress={() => router.push('/profile')}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          <MaterialIcons name="person" size={24} color={iconColor} style={styles.itemIcon} />
          <ThemedText style={[styles.negativeText, { color: textColor }]}>Hồ sơ</ThemedText>
          <MaterialIcons name="chevron-right" size={24} color={iconColor} />
        </View>
      </TouchableOpacity>
      {/* Cài đặt */}
      <TouchableOpacity
        style={[styles.listItem, { backgroundColor: listItemBackground, borderBottomColor: borderColor }]}
        onPress={() => router.push('/settings')}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          <MaterialIcons name="settings" size={24} color={iconColor} style={styles.itemIcon} />
          <ThemedText style={[styles.negativeText, { color: textColor }]}>Cài đặt</ThemedText>
          <MaterialIcons name="chevron-right" size={24} color={iconColor} />
        </View>
      </TouchableOpacity>
      {/* Đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: buttonBackground, opacity: isLoggingOut ? 0.6 : 1 }]}
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          <MaterialIcons name="logout" size={24} color="#fff" style={styles.itemIcon} />
          <ThemedText style={styles.logoutButtonText}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  listItem: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  negativeText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default User;