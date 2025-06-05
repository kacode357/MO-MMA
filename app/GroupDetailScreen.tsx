import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CreateGroupMemberApi, DeleteGroupMemberApi, SearchGroupMembersApi } from '@/services/group-member.services';
import { GetGroupByIdApi } from '@/services/group.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface Group {
  group_id: string;
  group_name: string;
  package_name: string;
  price: number;
  owner_username: string;
  created_at: string;
}

interface GroupMember {
  group_id: string;
  group_name: string;
  user_id: string;
  username: string;
}

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memberUserId, setMemberUserId] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeletingMember, setIsDeletingMember] = useState<string | null>(null); // Track deleting member
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(true);
  const [members, setMembers] = useState<GroupMember[]>([]);

  // Define colors using useThemeColor
  const colors = {
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    icon: useThemeColor({}, 'icon'),
    border: useThemeColor({}, 'icon'),
    listItem: useThemeColor({}, 'background'),
    button: useThemeColor({}, 'tint'),
  };

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) {
        Alert.alert('Lỗi', 'Không tìm thấy ID nhóm.');
        router.back();
        return;
      }

      setIsLoading(true);
      try {
        const response = await GetGroupByIdApi(groupId);
        if (response.status === 200) {
          setGroup(response.data);
        } else {
          throw new Error(response.data.message || 'Không thể lấy thông tin nhóm.');
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể tải thông tin nhóm.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, router]);

  useEffect(() => {
    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  const fetchGroupMembers = async () => {
    if (!groupId) return;

    try {
      const response = await SearchGroupMembersApi({ group_id: groupId, keyword: '' });
      if (response.status === 200) {
        setMembers(response.data.pageData);
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách thành viên.');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải danh sách thành viên.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddMember = async () => {
    if (!memberUserId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID người dùng.');
      return;
    }

    if (!group) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin nhóm.');
      return;
    }

    setIsAddingMember(true);
    try {
      const ownerId = await AsyncStorage.getItem('user_id');
      if (!ownerId) {
        throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
      }

      const response = await CreateGroupMemberApi({
        group_id: group.group_id,
        user_id: memberUserId,
        owner_id: ownerId,
      });

      if (response.status === 201) {
        setModalMessage('Thêm thành viên thành công!');
        setModalSuccess(true);
        setMemberUserId('');
        fetchGroupMembers(); // Refresh member list after adding
      } else {
        throw new Error(response.data.message || 'Không thể thêm thành viên.');
      }
    } catch (err: any) {
      setModalMessage(err.message || 'Lỗi khi thêm thành viên.');
      setModalSuccess(false);
    } finally {
      setIsAddingMember(false);
      setModalVisible(true);
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (!group) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin nhóm.');
      return;
    }

    // Confirm deletion
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa thành viên ${members.find((m) => m.user_id === userId)?.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingMember(userId);
            try {
              const response = await DeleteGroupMemberApi({
                group_id: group.group_id,
                user_id: userId,
              });

              if (response.status === 200) {
                setModalMessage('Xóa thành viên thành công!');
                setModalSuccess(true);
                fetchGroupMembers(); // Refresh member list after deletion
              } else {
                throw new Error(response.data.message || 'Không thể xóa thành viên.');
              }
            } catch (err: any) {
              setModalMessage(err.message || 'Lỗi khi xóa thành viên.');
              setModalSuccess(false);
            } finally {
              setIsDeletingMember(null);
              setModalVisible(true);
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalMessage('');
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
        <ThemedText style={[styles.text, { color: colors.text }]}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  if (!group) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.text, { color: colors.text }]}>Không tìm thấy thông tin nhóm.</ThemedText>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.button }]} onPress={handleBack} activeOpacity={0.7}>
          <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Chi tiết nhóm
      </ThemedText>

      <ThemedView style={[styles.groupCard, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
        <ThemedText style={[styles.groupTitle, { color: colors.text }]}>{group.group_name}</ThemedText>
        <ThemedText style={[styles.groupDetail, { color: colors.text }]}>Gói: {group.package_name}</ThemedText>
        <ThemedText style={[styles.groupDetail, { color: colors.text }]}>Giá: {group.price.toLocaleString()} VNĐ</ThemedText>
        <ThemedText style={[styles.groupDetail, { color: colors.text }]}>Chủ sở hữu: {group.owner_username}</ThemedText>
        <ThemedText style={[styles.groupDetail, { color: colors.text }]}>
          Tạo ngày: {new Date(group.created_at).toLocaleDateString()}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.addMemberContainer}>
        <ThemedText style={[styles.addMemberTitle, { color: colors.text }]}>Quản lý thành viên</ThemedText>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Nhập ID người dùng để thêm"
          placeholderTextColor={colors.icon}
          value={memberUserId}
          onChangeText={setMemberUserId}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.button, opacity: isAddingMember ? 0.6 : 1 }]}
          onPress={handleAddMember}
          disabled={isAddingMember}
          activeOpacity={0.7}
        >
          {isAddingMember ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.addButtonText}>Thêm</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.membersContainer}>
        <ThemedText style={[styles.addMemberTitle, { color: colors.text }]}>Danh sách thành viên</ThemedText>
        {members.length === 0 ? (
          <ThemedText style={[styles.text, { color: colors.text }]}>Không tìm thấy thành viên.</ThemedText>
        ) : (
          <ScrollView style={styles.membersList}>
            {members.map((member) => (
              <ThemedView
                key={member.user_id}
                style={[styles.memberCard, { backgroundColor: colors.listItem, borderColor: colors.border }]}
              >
                <ThemedView style={styles.memberInfo}>
                  <ThemedText style={[styles.memberText, { color: colors.text }]}>
                    Tên: {member.username}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: '#FF3B30', opacity: isDeletingMember === member.user_id ? 0.6 : 1 }]}
                  onPress={() => handleDeleteMember(member.user_id)}
                  disabled={isDeletingMember === member.user_id}
                  activeOpacity={0.7}
                >
                  {isDeletingMember === member.user_id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.deleteButtonText}>Xóa</ThemedText>
                  )}
                </TouchableOpacity>
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </ThemedView>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.button }]} onPress={handleBack} activeOpacity={0.7}>
        <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={[styles.closeButtonText, { color: colors.icon }]}>✕</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.modalMessage, { color: modalSuccess ? colors.button : colors.text }]}>
              {modalMessage}
            </ThemedText>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.button }]}
              onPress={closeModal}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.modalButtonText}>Đóng</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
};

// Updated styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginVertical: 16,
  },
  groupCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  groupDetail: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  addMemberContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  addMemberTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  membersContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  membersList: {
    maxHeight: 300,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberText: {
    fontSize: 16,
    lineHeight: 24,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
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
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupDetailScreen;