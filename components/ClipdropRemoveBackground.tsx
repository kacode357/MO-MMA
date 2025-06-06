import { CreateChatSessionApi, SendImageMessageApi } from '@/services/allmodelservices';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Type definitions
interface ImageData {
  mimeType: string;
  data: string;
}

interface ClipdropRemoveBackgroundProps {
  package_id: string;
  first_supported_feature: string;
  ai_model: string;
}

const ClipdropRemoveBackground: React.FC<ClipdropRemoveBackgroundProps> = ({
  package_id,
  first_supported_feature,
  ai_model,
}) => {
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded prompt for background removal
  const HARDCODED_PROMPT = 'Remove the background from the image';

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library was denied');
      }
    })();
  }, []);

  // Create session
  const createSession = useCallback(async (): Promise<string> => {
    try {
      const response = await CreateChatSessionApi({
        package_id,
        title: 'Background Removal Session',
      });
      const sessionId = response.data.session_id;
      setChatSessionId(sessionId);
      return sessionId;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create session';
      setError(errorMessage);
      throw err;
    }
  }, [package_id]);

  // Pick image
  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0].base64) {
        const mimeType = result.assets[0].mimeType || 'image/jpeg';
        setSelectedImage({
          mimeType,
          data: result.assets[0].base64,
        });
        setResultImage(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to pick image');
    }
  }, []);

  // Send background removal request
  const removeBackground = useCallback(async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionId = chatSessionId || (await createSession());
      const response = await SendImageMessageApi(sessionId, {
        prompt: HARDCODED_PROMPT,
        message_type: first_supported_feature,
        ai_source: ai_model,
        input_image: selectedImage,
      });

      let images: ImageData[] = [];
      try {
        const parsed = JSON.parse(response.data.response);
        if (parsed.images && Array.isArray(parsed.images)) {
          images = parsed.images.filter(
            (img: any) => typeof img.mimeType === 'string' && typeof img.data === 'string'
          );
        }
      } catch {
        throw new Error('Failed to parse response data');
      }

      if (images.length > 0) {
        setResultImage(images[0]);
      } else {
        setError('No image generated');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove background';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage, chatSessionId, createSession, first_supported_feature, ai_model]);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.removeButton, !selectedImage && styles.buttonDisabled]}
          onPress={removeBackground}
          disabled={!selectedImage || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Remove Background</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.imageGrid}>
        <View style={styles.imageCard}>
          <Text style={styles.cardTitle}>Original Image</Text>
          {selectedImage ? (
            <Image
              source={{ uri: `data:${selectedImage.mimeType};base64,${selectedImage.data}` }}
              style={styles.image}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>
        <View style={styles.imageCard}>
          <Text style={styles.cardTitle}>Processed Image</Text>
          {resultImage ? (
            <Image
              source={{ uri: `data:${resultImage.mimeType};base64,${resultImage.data}` }}
              style={styles.image}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No result yet</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  imageCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  placeholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ClipdropRemoveBackground;