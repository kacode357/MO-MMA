import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgtbovcjg/image/upload';
const UPLOAD_PRESET = 'mma-upload';

interface UploadResult {
  imageUri: string | null;
  imageUrl: string | null;
}

const uploadImage = async (
  setImageUri: (uri: string | null) => void,
  setImageUrl: (url: string | null) => void,
  setIsUploading: (uploading: boolean) => void
): Promise<UploadResult> => {
  setIsUploading(true);
  try {
    // Request permission to access photo library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
      return { imageUri: null, imageUrl: null };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) {
      Alert.alert('Thông báo', 'Bạn đã hủy chọn ảnh.');
      return { imageUri: null, imageUrl: null };
    }

    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.secure_url) {
        setImageUrl(response.data.secure_url);
        Alert.alert('Thành công', 'Ảnh đã được tải lên Cloudinary!');
        return { imageUri: uri, imageUrl: response.data.secure_url };
      } else {
        throw new Error('Không nhận được URL ảnh');
      }
    }
    return { imageUri: null, imageUrl: null };
  } catch (error: any) {
    Alert.alert('Lỗi', 'Tải ảnh lên thất bại: ' + (error.message || 'Lỗi không xác định'));
    console.error('Lỗi tải lên Cloudinary:', error);
    return { imageUri: null, imageUrl: null };
  } finally {
    setIsUploading(false);
  }
};

export { uploadImage };

