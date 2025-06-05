import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CreateGroupApi, GetAllGroupsApi } from '@/services/group.services';
import { SearchPurchaseApi } from '@/services/purchase.services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface PremiumGroupContentProps {
  colors: {
    background: string;
    text: string;
    icon: string;
    border: string;
    listItem: string;
    button: string;
  };
}

interface Purchase {
  purchase_id: string;
  package_id: string;
  package_name: string;
  price: number;
  status: string;
  purchase_date: string;
  username: string;
}

interface Group {
  group_id: string;
  group_name: string;
  package_name: string;
  price: number;
  created_at: string;
}

const PremiumGroupContent = ({ colors }: PremiumGroupContentProps) => {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [groupName, setGroupName] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch purchases
        const purchaseResponse = await SearchPurchaseApi({
          searchCondition: {
            keyword: '',
            status: 'completed',
            is_premium: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 10,
          },
        });

        if (purchaseResponse.status === 200) {
          setPurchases(purchaseResponse.data.pageData);
        } else {
          throw new Error(purchaseResponse.data.message || 'Không thể lấy danh sách giao dịch.');
        }

        // Fetch group
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
        }

        const groupResponse = await GetAllGroupsApi({
          searchCondition: {
            keyword: userId, // Filter by owner_id
            status: 'active',
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 1, // Only one group expected
          },
        });

        if (groupResponse.status === 200 && groupResponse.data.pageData.length > 0) {
          setGroup(groupResponse.data.pageData[0]);
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể tải dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
  };

  const handleCreateGroup = async () => {
    if (!selectedPurchase) {
      Alert.alert('Lỗi', 'Vui lòng chọn một gói để tạo nhóm.');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm.');
      return;
    }

    setIsCreating(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        throw new Error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
      }

      const response = await CreateGroupApi({
        group_name: groupName,
        owner_id: userId,
        package_id: selectedPurchase.package_id,
        purchase_id: selectedPurchase.purchase_id,
      });

      if (response.status === 201) {
        const newGroup = {
          group_id: response.data.group_id,
          group_name: groupName,
          package_name: selectedPurchase.package_name,
          price: selectedPurchase.price,
          created_at: new Date().toISOString(),
        };
        setGroup(newGroup);
        setModalMessage('Tạo nhóm thành công!');
        setModalSuccess(true);
        setGroupName('');
        setSelectedPurchase(null);
      } else {
        throw new Error(response.data.message || 'Không thể tạo nhóm.');
      }
    } catch (err: any) {
      setModalMessage(err.message || 'Lỗi khi tạo nhóm.');
      setModalSuccess(false);
    } finally {
      setIsCreating(false);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalMessage('');
  };

  const handleGroupPress = () => {
    if (group) {
      router.push({
        pathname: '/GroupDetailScreen',
        params: { groupId: group.group_id },
      });
    }
  };

  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <TouchableOpacity
      style={[
        styles.purchaseItem,
        {
          backgroundColor: selectedPurchase?.purchase_id === item.purchase_id ? colors.button : colors.listItem,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleSelectPurchase(item)}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.purchaseText, { color: selectedPurchase?.purchase_id === item.purchase_id ? '#FFFFFF' : colors.text }]}>
        {item.package_name} - {item.price.toLocaleString()} VNĐ
      </ThemedText>
      <ThemedText style={[styles.purchaseSubText, { color: selectedPurchase?.purchase_id === item.purchase_id ? '#FFFFFF' : colors.text }]}>
        Mua vào: {new Date(item.purchase_date).toLocaleDateString()}
      </ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.icon} />
        <ThemedText style={[styles.text, { color: colors.text }]}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
          Quản lý nhóm
        </ThemedText>

        {/* Group Section */}
        {group ? (
          <ThemedView style={[styles.groupCard, { backgroundColor: colors.listItem, borderColor: colors.border }]}>
            <ThemedText style={[styles.groupTitle, { color: colors.text }]}>{group.group_name}</ThemedText>
            <ThemedText style={[styles.groupDetail, { color: colors.text }]}>
              Gói: {group.package_name}
            </ThemedText>
            <ThemedText style={[styles.groupDetail, { color: colors.text }]}>
              Giá: {group.price.toLocaleString()} VNĐ
            </ThemedText>
            <ThemedText style={[styles.groupDetail, { color: colors.text }]}>
              Tạo ngày: {new Date(group.created_at).toLocaleDateString()}
            </ThemedText>
            <TouchableOpacity
              style={[styles.viewGroupButton, { backgroundColor: colors.button }]}
              onPress={handleGroupPress}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.viewGroupButtonText}>Xem chi tiết nhóm</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            <ThemedText style={[styles.subTitle, { color: colors.text }]}>Chưa có nhóm</ThemedText>
            <ThemedText style={[styles.text, { color: colors.text, marginBottom: 16 }]}>
              Vui lòng chọn gói và tạo nhóm mới.
            </ThemedText>

            {/* Purchase Selection */}
            {purchases.length === 0 ? (
              <ThemedText style={[styles.text, { color: colors.text }]}>
                Bạn chưa có giao dịch nào hoàn tất để tạo nhóm.
              </ThemedText>
            ) : (
              <>
                <ThemedText style={[styles.subTitle, { color: colors.text }]}>Chọn gói</ThemedText>
                <FlatList
                  data={purchases}
                  renderItem={renderPurchaseItem}
                  keyExtractor={(item) => item.purchase_id}
                  contentContainerStyle={styles.listContainer}
                />
              </>
            )}

            {/* Create Group Form */}
            {purchases.length > 0 && (
              <ThemedView style={styles.createGroupContainer}>
                <ThemedText style={[styles.createGroupTitle, { color: colors.text }]}>Tạo nhóm mới</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Nhập tên nhóm"
                  placeholderTextColor={colors.icon}
                  value={groupName}
                  onChangeText={setGroupName}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: colors.button, opacity: isCreating ? 0.6 : 1 }]}
                  onPress={handleCreateGroup}
                  disabled={isCreating}
                  activeOpacity={0.7}
                >
                  {isCreating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.createButtonText}>Tạo nhóm</ThemedText>
                  )}
                </TouchableOpacity>
              </ThemedView>
            )}
          </>
        )}

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
    </KeyboardAvoidingView>
  );
};

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
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 16,
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
  viewGroupButton: {
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
  viewGroupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  createGroupContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  createGroupTitle: {
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
  createButton: {
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
  createButtonText: {
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

export default PremiumGroupContent;