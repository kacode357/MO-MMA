import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Button, Text, ActivityIndicator } from 'react-native-paper';
import { deleteFood } from '../../../services/api'; // Import API deleteFood

interface DeleteFoodModalProps {
  foodId: string;
  onClose: () => void;
  onFoodDeleted: () => void;
}

const DeleteFoodModal: React.FC<DeleteFoodModalProps> = ({ foodId, onClose, onFoodDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFood(foodId); // Gọi API để xóa món ăn
      onFoodDeleted(); // Gọi callback để làm mới danh sách món ăn
      onClose(); // Đóng modal
    } catch (error) {
      console.error('Error deleting food:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Text variant="titleLarge" style={styles.title}>
          Confirm Delete
        </Text>
        <Text style={styles.message}>Are you sure you want to delete this food?</Text>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleDelete}
            loading={loading}
            disabled={loading}
            style={styles.confirmButton}
          >
            {loading ? 'Deleting...' : 'Confirm'}
          </Button>
          <Button mode="text" onPress={onClose} disabled={loading}>
            Cancel
          </Button>
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
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
  },
  foodId: {
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

export default DeleteFoodModal;
