import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CheckLogin = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vui lòng đăng nhập</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Default background, can be themed if needed
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000', // Default text color, can be themed
  },
  button: {
    backgroundColor: '#007AFF', // Blue button color, can be customized
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default CheckLogin;