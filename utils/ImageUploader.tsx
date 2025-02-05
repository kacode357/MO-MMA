import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../config/firebaseConfig"; // Đường dẫn tới firebaseConfig
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button, ActivityIndicator, Text } from "react-native-paper";

interface ImageUploaderProps {
  onUpload: (url: string) => void; // Callback trả URL về cho component cha
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false); // Trạng thái upload
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // URL của ảnh đã upload

  const pickAndUploadImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "Permission to access the gallery is required!");
        return;
      }

      // Chọn ảnh từ thư viện
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Bắt đầu upload ảnh
        setUploading(true);
        const uri = selectedAsset.uri;

        // Chuyển đổi URI sang Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Tạo reference trong Firebase Storage
        const fileName = `images/${Date.now()}.jpg`; // Tên file duy nhất
        const storageRef = ref(storage, fileName);

        // Upload file
        await uploadBytes(storageRef, blob);

        // Lấy URL của ảnh đã upload
        const downloadURL = await getDownloadURL(storageRef);
        setUploadedImageUrl(downloadURL); // Lưu URL của ảnh đã upload
        onUpload(downloadURL); // Gọi callback trả URL về component cha
        Alert.alert("Success", "Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload Failed", "There was an error uploading the image.");
    } finally {
      setUploading(false); // Kết thúc trạng thái upload
    }
  };

  return (
    <View style={styles.container}>
      {uploadedImageUrl ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: uploadedImageUrl }} style={styles.imagePreview} />
          <Text style={styles.imageUrlText}>Image uploaded successfully!</Text>
        </View>
      ) : (
        <Button
          mode="contained"
          onPress={pickAndUploadImage}
          loading={uploading}
          disabled={uploading}
          style={styles.uploadButton}
          labelStyle={styles.buttonLabel}
        >
          {uploading ? "Uploading..." : "Pick and Upload Image"}
        </Button>
      )}
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: "center",
  },
  uploadButton: {
    borderRadius: 8,
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  loadingContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6200ee",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageUrlText: {
    fontSize: 14,
    color: "#6200ee",
    textAlign: "center",
  },
});

export default ImageUploader;
