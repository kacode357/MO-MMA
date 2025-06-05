import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { GetCurrentLoginApi, UpdateUserApi } from '@/services/user.services';
import { uploadImage } from '@/utils/uploadImage';
import { Ionicons } from '@expo/vector-icons'; // For diamond icon
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface User {
  full_name: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
  });

  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  // Fetch current user data
  const fetchCurrentUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await GetCurrentLoginApi();
      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        setFormData({
          full_name: userData.full_name,
          email: userData.email,
          avatar_url: userData.avatar_url || '',
        });
      } else {
        throw new Error('Không thể lấy thông tin người dùng.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const response = await UpdateUserApi({
        full_name: formData.full_name,
        email: formData.email,
        avatar_url: formData.avatar_url,
      });
      if (response.status === 200) {
        setUser({
          ...user!,
          full_name: formData.full_name,
          email: formData.email,
          avatar_url: formData.avatar_url,
        });
        setIsEditing(false);
        Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      } else {
        throw new Error(response.data.message || 'Không thể cập nhật thông tin.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image selection
  const handleSelectImage = async () => {
    await uploadImage(
      () => {}, // No need for setImageUri as preview isn't shown immediately
      (url) => setFormData((prev) => ({ ...prev, avatar_url: url || '' })), // Update avatar URL
      setIsUploading
    );
  };

  // Fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={[styles.loadingText, { color: tintColor }]}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText style={[styles.errorText, { color: Colors.red.tint }]}>Lỗi: {error}</ThemedText>
      </ThemedView>
    );
  }

  // No user state
  if (!user) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText style={[styles.noDataText, { color: textColor }]}>Không tìm thấy thông tin người dùng.</ThemedText>
      </ThemedView>
    );
  }

  // Map role to display text
  const roleDisplay = user.role === 'user' ? 'Thành Viên' : user.role === 'premium' ? 'Premium' : user.role;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={[styles.profileCard, { backgroundColor: backgroundColor === Colors.custom.background ? '#2a2a32' : '#FFFFFF' }]}>
          {/* Avatar */}
          {formData.avatar_url ? (
            <Image
              source={{ uri: formData.avatar_url }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <ThemedView style={[styles.avatarContainer, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.avatarText}>{user.full_name.charAt(0).toUpperCase()}</ThemedText>
            </ThemedView>
          )}

          {/* Select Image Button (edit mode only) */}
          {isEditing && (
            <TouchableOpacity
              style={[styles.selectImageButton, { backgroundColor: tintColor, opacity: isUploading ? 0.6 : 1 }]}
              onPress={handleSelectImage}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>
                {isUploading ? 'Đang tải ảnh...' : 'Chọn ảnh'}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Username */}
          <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Tên người dùng:</ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>{user.username}</ThemedText>

          {/* Full Name */}
          {isEditing ? (
            <>
              <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Họ tên:</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                value={formData.full_name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
                placeholder="Nhập họ tên"
                placeholderTextColor={iconColor}
              />
            </>
          ) : (
            <>
              <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Họ tên:</ThemedText>
              <ThemedText style={[styles.infoText, { color: textColor }]}>{user.full_name}</ThemedText>
            </>
          )}

          {/* Email */}
          <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Email:</ThemedText>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColor, borderColor: iconColor }]}
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
              placeholder="Nhập email"
              placeholderTextColor={iconColor}
              keyboardType="email-address"
            />
          ) : (
            <ThemedText style={[styles.infoText, { color: textColor }]}>{user.email}</ThemedText>
          )}

          {/* Role Display */}
          <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Tình trạng:</ThemedText>
          <ThemedView style={styles.roleContainer}>
            <ThemedText style={[styles.infoText, { color: user.role === 'premium' ? Colors.gold.tint : textColor }]}>
              {roleDisplay}
            </ThemedText>
            {user.role === 'premium' && (
              <Ionicons name="diamond" size={16} color={Colors.gold.tint} style={styles.diamondIcon} />
            )}
          </ThemedView>

          {/* Created Date */}
          <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Ngày tạo:</ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            {new Date(user.created_at).toLocaleDateString('vi-VN')}
          </ThemedText>

          {/* Action Buttons */}
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: tintColor, opacity: isSaving ? 0.6 : 1 }]}
              onPress={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu' : 'Chỉnh sửa'}
              </ThemedText>
            </TouchableOpacity>

            {/* Cancel Button (edit mode only) */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.red.tint }]}
                onPress={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: user.full_name,
                    email: user.email,
                    avatar_url: user.avatar_url || '',
                  });
                }}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.buttonText}>Hủy</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  profileCard: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  selectImageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 12,
  },
  infoText: {
    fontSize: 16,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    padding: 8,
    borderRadius: 2,
  },
  diamondIcon: {
    marginLeft: 6,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});