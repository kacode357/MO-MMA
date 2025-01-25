import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, Image } from 'react-native';
import { Card, Text, ActivityIndicator, FAB, IconButton } from 'react-native-paper';
import { getAPIFoods } from '../../../services/api'; // Giả sử bạn có API tương ứng
import AddFoodModal from './AddFoodModal'; // Component thêm món ăn
import EditFoodModal from './EditFoodModal'; // Component sửa món ăn
import DeleteFoodModal from './DeleteFoodModal'; // Component xóa món ăn

interface Food {
  _id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_name : string;
}

const FoodsScreen = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const refreshFoods = async () => {
    setLoading(true); 
    try {
      const response = await getAPIFoods(
             { keyword: '', is_delete: false },
             { pageNum: 1, pageSize: 10 }
           );
      setFoods(response.pageData); 
    } catch (error) {
      console.error('Error refreshing foods:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    refreshFoods(); 
  }, []);

  const handleEditPress = (id: string) => {
    setSelectedFoodId(id);
    setShowEditModal(true);
  };

  const handleDeletePress = (id: string) => {
    setSelectedFoodId(id);
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
        data={foods}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Image source={{ uri: item.image_url }} style={styles.foodImage} />
                <View style={styles.content}>
                  <Text variant="bodyLarge">
                    <Text style={{ fontWeight: 'bold' }}>Name:</Text> {item.name}
                  </Text>
                    <Text variant="bodyMedium">
                        <Text style={{ fontWeight: 'bold' }}>Category:</Text> {item.category_name}
                    </Text>
                  <Text variant="bodyMedium">
                    <Text style={{ fontWeight: 'bold' }}>Price:</Text> {item.price} VND
                  </Text>
                  <Text variant="bodyMedium" numberOfLines={2} ellipsizeMode="tail">
                    <Text style={{ fontWeight: 'bold' }}>Description:</Text> {item.description}
                  </Text>
                </View>
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
      {/* Modal thêm món ăn */}
      <AddFoodModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onFoodAdded={refreshFoods} // Làm mới danh sách sau khi thêm
      />
      {/* Modal chỉnh sửa món ăn */}
      {showEditModal && selectedFoodId && (
        <EditFoodModal
          foodId={selectedFoodId}
          onClose={() => setShowEditModal(false)}
          onFoodUpdated={refreshFoods} // Làm mới danh sách sau khi sửa
        />
      )}
      {/* Modal xóa món ăn */}
      {showDeleteModal && selectedFoodId && (
        <DeleteFoodModal
          foodId={selectedFoodId}
          onClose={() => setShowDeleteModal(false)}
          onFoodDeleted={refreshFoods} // Làm mới danh sách sau khi xóa
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
    marginLeft: 16,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
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

export default FoodsScreen;
