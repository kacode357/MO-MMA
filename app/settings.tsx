import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function Settings() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Cài đặt</ThemedText>
      <ThemedView style={styles.listContainer}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push('/theme')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.listItemText}>Cài đặt Chủ đề</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push('/camera')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.listItemText}>Cài đặt Camera</ThemedText>
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
  listContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});