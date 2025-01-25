import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { getCategoryById, updateCategory } from '../../../services/api'; // Import APIs

interface EditCategoryModalProps {
  categoryId: string;
  onClose: () => void;
  onCategoryUpdated: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ categoryId, onClose, onCategoryUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch category data when modal opens
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const category = await getCategoryById(categoryId); // Gọi API để lấy dữ liệu danh mục
        setName(category.name); // Đặt tên danh mục vào state
        setDescription(category.description); // Đặt mô tả danh mục vào state
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateCategory(categoryId, { name, description }); // Gọi API để cập nhật danh mục
      onCategoryUpdated(); // Gọi callback để làm mới danh sách
      onClose(); // Đóng modal
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Portal>
        <Modal visible onDismiss={onClose}>
          <View style={styles.modalContainer}>
            <ActivityIndicator animating={true} size="large" color="#6200ee" />
          
          </View>
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal visible onDismiss={onClose}>
        <View style={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.title}>
            Edit Category
          </Text>
          <TextInput
            label="Category Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            style={styles.input}
          />
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button mode="text" onPress={onClose} disabled={saving}>
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
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default EditCategoryModal;
