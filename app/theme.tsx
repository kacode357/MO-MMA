import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Cài đặt Chủ đề</ThemedText>
      <ThemedText style={styles.label}>Chủ đề hiện tại: {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : theme === 'red' ? 'Đỏ' : theme === 'green' ? 'Xanh lá' : theme === 'blue' ? 'Xanh dương' : 'Tùy chỉnh'}</ThemedText>
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.light.background, opacity: theme === 'light' ? 0.6 : 1 }]}
          onPress={() => setTheme('light')}
          disabled={theme === 'light'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.light.text }]}>Chủ đề Sáng</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.dark.background, opacity: theme === 'dark' ? 0.6 : 1 }]}
          onPress={() => setTheme('dark')}
          disabled={theme === 'dark'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.dark.text }]}>Chủ đề Tối</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.red.background, opacity: theme === 'red' ? 0.6 : 1 }]}
          onPress={() => setTheme('red')}
          disabled={theme === 'red'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.red.text }]}>Chủ đề Đỏ</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.green.background, opacity: theme === 'green' ? 0.6 : 1 }]}
          onPress={() => setTheme('green')}
          disabled={theme === 'green'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.green.text }]}>Chủ đề Xanh lá</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.blue.background, opacity: theme === 'blue' ? 0.6 : 1 }]}
          onPress={() => setTheme('blue')}
          disabled={theme === 'blue'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.blue.text }]}>Chủ đề Xanh dương</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: Colors.custom.background, opacity: theme === 'custom' ? 0.6 : 1 }]}
          onPress={() => setTheme('custom')}
          disabled={theme === 'custom'}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.buttonText, { color: Colors.custom.text }]}>Chủ đề Tùy chỉnh</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  themeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});