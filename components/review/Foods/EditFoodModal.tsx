import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Modal, Portal, TextInput, Button, Text, ActivityIndicator, Menu, IconButton } from 'react-native-paper';
import { getFoodById, updateFood, getApiCategories } from '../../../services/api'; // Import API
import ImageUploader from '../../../utils/ImageUploader'; // Import ImageUploader

interface EditFoodModalProps {
  foodId: string;
  onClose: () => void;
  onFoodUpdated: () => void;
}

const EditFoodModal: React.FC<EditFoodModalProps> = ({ foodId, onClose, onFoodUpdated }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(''); // Hiển thị tên danh mục
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getApiCategories(
          { keyword: '', is_delete: false },
          { pageNum: 1, pageSize: 10 }
        );
        setCategories(response.pageData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchFood = async () => {
      setLoading(true);
      try {
        const foodData = await getFoodById(foodId); // Fetch dữ liệu món ăn
        setName(foodData.name);
        setPrice(foodData.price.toString());
        setDescription(foodData.description);
        setImageUrl(foodData.image_url);
        setSelectedCategoryId(foodData.category_id || null); // Lưu category_id
        setSelectedCategoryName(foodData.category_name || ''); // Lưu category_name
      } catch (error) {
        console.error('Error fetching food:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchFood();
  }, [foodId]);

  const handleSave = async () => {
    if (!name || !price || !description || !imageUrl || !selectedCategoryId) {
      console.warn('All fields are required!');
      return;
    }

    setSaving(true);
    try {
      await updateFood(foodId, {
        name,
        category: selectedCategoryId,
        price: Number(price),
        description,
        image_url: imageUrl,
      });
      onFoodUpdated(); // Gọi callback để làm mới danh sách món ăn
      onClose(); // Đóng modal
    } catch (error) {
      console.error('Error updating food:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Portal>
        <Modal visible onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
          <ActivityIndicator animating={true} size="large" color="#6200ee" />
       
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal visible onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <KeyboardAvoidingView behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text variant="titleLarge" style={styles.title}>
                Edit Food
              </Text>
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
                  value={selectedCategoryName} // Hiển thị tên danh mục
                  editable={false}
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
                        setSelectedCategoryId(category._id); // Cập nhật category_id
                        setSelectedCategoryName(category.name); // Cập nhật category_name
                        setMenuVisible(false);
                      }}
                      title={category.name}
                    />
                  ))}
                </Menu>
              </View>
              {/* ImageUploader */}
              <ImageUploader
                onUpload={(url) => {
                  setImageUrl(url); // Cập nhật URL ảnh
                }}
              />
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.button}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button mode="text" onPress={onClose}>
                Cancel
              </Button>
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

export default EditFoodModal;
