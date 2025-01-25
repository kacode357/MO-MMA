import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Modal, Portal, TextInput, Button, Text, ActivityIndicator, Menu, IconButton } from 'react-native-paper';
import { getApiCategories, createFood } from '../../../services/api'; // Import API
import ImageUploader from '../../../utils/ImageUploader'; // Import ImageUploader

interface AddFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onFoodAdded: () => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ visible, onClose, onFoodAdded }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // State cho URL ảnh
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setFetchingCategories(true);
      try {
        const response = await getApiCategories(
          { keyword: '', is_delete: false },
          { pageNum: 1, pageSize: 10 }
        );
        setCategories(response.pageData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setFetchingCategories(false);
      }
    };

    if (visible) {
      fetchCategories(); // Fetch categories khi modal được mở
    }
  }, [visible]);

  const handleAddFood = async () => {
    if (!name || !price || !description || !imageUrl || !selectedCategory) {
      console.warn('All fields are required!');
      return;
    }

    setLoading(true);
    try {
      await createFood({
        name,
        price: Number(price),
        description,
        image_url: imageUrl,
        category: selectedCategory,
      });
      onFoodAdded(); // Gọi callback để làm mới danh sách món ăn
      onClose(); // Đóng modal
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <KeyboardAvoidingView behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text variant="titleLarge" style={styles.title}>
                Add New Food
              </Text>
              {fetchingCategories ? (
                <ActivityIndicator animating={true} size="large" color="#6200ee" />
              ) : (
                <>
                  <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                  />
                  <TextInput
                    label="Price"
                    value={price}
                    onChangeText={setPrice}
                    mode="outlined"
                    keyboardType="numeric"
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
                  {/* Dropdown chọn category */}
                  <View style={styles.categoryInput}>
                    <TextInput
                      label="Category"
                      value={
                        selectedCategory
                          ? categories.find((cat) => cat._id === selectedCategory)?.name || ''
                          : ''
                      }
                      editable={false} // Không cho phép chỉnh sửa trực tiếp
                      mode="outlined"
                      style={{ flex: 1 }}
                    />
                    <Menu
                      visible={menuVisible}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <IconButton
                          icon="chevron-down"
                          size={24}
                          onPress={() => setMenuVisible(true)}
                          style={styles.dropdownButton}
                        />
                      }
                    >
                      {categories.map((category) => (
                        <Menu.Item
                          key={category._id}
                          onPress={() => {
                            setSelectedCategory(category._id);
                            setMenuVisible(false);
                          }}
                          title={category.name}
                        />
                      ))}
                    </Menu>
                  </View>
                  {/* ImageUploader cho phép chọn ảnh */}
                  <ImageUploader
                    onUpload={(url) => {
                      setImageUrl(url); // Lưu URL ảnh vào state
                    }}
                  />
                  <Button
                    mode="contained"
                    onPress={handleAddFood}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                  >
                    {loading ? 'Adding...' : 'Add Food'}
                  </Button>
                  <Button mode="text" onPress={onClose}>
                    Cancel
                  </Button>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  categoryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownButton: {
    marginLeft: 8,
    marginTop: -8,
  },
});

export default AddFoodModal;
