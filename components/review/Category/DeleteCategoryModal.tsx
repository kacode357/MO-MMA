import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Button, Text, ActivityIndicator } from 'react-native-paper';
import { deleteCategory } from '../../../services/api';

interface DeleteCategoryModalProps {
  categoryId: string;
  onClose: () => void;
  onCategoryDeleted: () => void; // Thay đổi tên callback cho khớp logic trong CategoryScreen
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  categoryId,
  onClose,
  onCategoryDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCategory(categoryId); // Gọi API để xóa danh mục
      onCategoryDeleted(); // Gọi callback để làm mới danh sách
      onClose(); // Đóng modal sau khi xóa thành công
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible onDismiss={onClose}>
        <View style={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.title}>
            Confirm Delete
          </Text>
          <Text style={styles.message}>
            Are you sure you want to delete this category?
          </Text>
          <Text style={styles.categoryId}>Category ID: {categoryId}</Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleDelete}
              disabled={loading}
              loading={loading}
              style={styles.confirmButton}
            >
              {loading ? 'Deleting...' : 'Confirm'}
            </Button>
            <Button mode="text" onPress={onClose} disabled={loading}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryId: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default DeleteCategoryModal;
