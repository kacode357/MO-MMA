import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Định nghĩa các theme có thể sử dụng
type Theme = 'light' | 'dark' | 'red' | 'green' | 'blue' | 'custom';

// Định nghĩa type cho context
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Tạo context với giá trị mặc định là undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hàm lưu theme vào AsyncStorage
const saveTheme = async (theme: Theme): Promise<void> => {
  try {
    await AsyncStorage.setItem('appTheme', theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

// Hàm lấy theme từ AsyncStorage
const loadTheme = async (): Promise<Theme | null> => {
  try {
    const savedTheme = await AsyncStorage.getItem('appTheme');
    if (savedTheme && ['light', 'dark', 'red', 'green', 'blue', 'custom'].includes(savedTheme)) {
      return savedTheme as Theme;
    }
    return null;
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
};

// Component ThemeProvider để cung cấp theme cho toàn bộ ứng dụng
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  // Load theme từ AsyncStorage khi component được mount
  useEffect(() => {
    loadTheme().then((savedTheme) => {
      if (savedTheme) {
        setThemeState(savedTheme);
      }
    });
  }, []);

  // Hàm setTheme để cập nhật theme và lưu vào AsyncStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // Map theme tùy chỉnh với react-navigation
  const navigationTheme = (() => {
    switch (theme) {
      case 'dark':
        return DarkTheme;
      case 'red':
        return {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.red.tint,
            background: Colors.red.background,
            card: Colors.red.background,
            text: Colors.red.text,
            border: Colors.red.icon,
          },
        };
      case 'green':
        return {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.green.tint,
            background: Colors.green.background,
            card: Colors.green.background,
            text: Colors.green.text,
            border: Colors.green.icon,
          },
        };
      case 'blue':
        return {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.blue.tint,
            background: Colors.blue.background,
            card: Colors.blue.background,
            text: Colors.blue.text,
            border: Colors.blue.icon,
          },
        };
      case 'custom':
        return {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.custom.tint,
            background: Colors.custom.background,
            card: Colors.custom.background,
            text: Colors.custom.text,
            border: Colors.custom.icon,
          },
        };
      default:
        return DefaultTheme;
    }
  })();

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook để sử dụng theme trong các component
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};