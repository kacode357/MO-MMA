import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import ImageUploader from "../../utils/ImageUploader"; // Đường dẫn tới ImageUploader

const ReportsScreen = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = (url: string) => {
    setImageUrl(url); // Lưu URL của ảnh sau khi upload
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports Screen</Text>
      <ImageUploader onUpload={handleUpload} />
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 16,
    borderRadius: 8,
  },
});

export default ReportsScreen;
