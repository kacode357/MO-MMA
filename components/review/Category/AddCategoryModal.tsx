import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import { createCategory } from '../../../services/api'; // Import API

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: () => void; 
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onClose,
  onCategoryAdded,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!name || !description) {
      console.warn('Name and description cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      // Gọi API để tạo danh mục
      const newCategory = await createCategory({ name, description });
      onCategoryAdded();
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose}>
        <View style={{ backgroundColor: 'white', padding: 20, margin: 16, borderRadius: 8 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Add New Category
          </Text>
          <TextInput
            label="Category Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={{ marginBottom: 16 }}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            style={{ marginBottom: 16 }}
          />
          <Button
            mode="contained"
            onPress={handleAddCategory}
            loading={loading}
            disabled={loading}
            style={{ marginBottom: 8 }}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </Button>
          <Button mode="text" onPress={onClose}>
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default AddCategoryModal;
