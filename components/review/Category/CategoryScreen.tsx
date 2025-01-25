import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Card, Text, ActivityIndicator, FAB, IconButton } from 'react-native-paper';
import { getApiCategories } from '../../../services/api';
import AddCategoryModal from './AddCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';

interface Category {
  _id: string;
  name: string;
  description: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const CategoryScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const refreshCategories = async () => {
    setLoading(true); // Bắt đầu trạng thái tải
    try {
      const response = await getApiCategories(
        { keyword: '', is_delete: false },
        { pageNum: 1, pageSize: 10 }
      );
      setCategories(response.pageData); // Cập nhật danh sách categories
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setLoading(false); // Dừng trạng thái tải
    }
  };

  useEffect(() => {
    refreshCategories(); // Lần đầu tiên tải dữ liệu
  }, []);

  const handleEditPress = (id: string) => {
    setSelectedCategoryId(id);
    setShowEditModal(true);
  };

  const handleDeletePress = (id: string) => {
    setSelectedCategoryId(id);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator animating={true} size="large" color="#6200ee" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                {/* Nội dung chính */}
                <View style={styles.content}>
                  <Text variant="bodyLarge">
                    <Text style={{ fontWeight: 'bold' }}>Name:</Text> {item.name}
                  </Text>
                  <Text variant="bodyMedium" numberOfLines={2} ellipsizeMode="tail">
                    <Text style={{ fontWeight: 'bold' }}>Description:</Text> {item.description}
                  </Text>
                </View>

                {/* Các icon hành động */}
                <View style={styles.iconContainer}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEditPress(item._id)}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDeletePress(item._id)}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      />
      {/* Nút FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="white"
        size="medium"
      />
      {/* Modal thêm danh mục */}
      <AddCategoryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onCategoryAdded={refreshCategories} // Làm mới danh sách sau khi thêm
      />
      {/* Modal chỉnh sửa danh mục */}
      {showEditModal && selectedCategoryId && (
        <EditCategoryModal
          categoryId={selectedCategoryId}
          onClose={() => setShowEditModal(false)}
          onCategoryUpdated={refreshCategories} // Làm mới danh sách sau khi sửa
        />
      )}
      {/* Modal xóa danh mục */}
      {showDeleteModal && selectedCategoryId && (
        <DeleteCategoryModal
          categoryId={selectedCategoryId}
          onClose={() => setShowDeleteModal(false)}
          onCategoryDeleted={refreshCategories} // Làm mới danh sách sau khi xóa
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default CategoryScreen;
