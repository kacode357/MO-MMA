import { defaultAxiosInstance } from "../utils/axios.customize";

export const getApiFood = async (
  searchCondition: { keyword: string; is_delete: boolean },
  pageInfo: { pageNum: number; pageSize: number }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/foods/search", { searchCondition, pageInfo });
  return response.data;
};

export const getApiOrders = async () => {
  const response = await defaultAxiosInstance.get("/v1/api/orders");
  return response.data;
};
export const updateOrderItem = async (
  updateData: { food_id: string; quantity: number }
) => {
  const response = await defaultAxiosInstance.put(`/v1/api/orders/items`, updateData);
  return response.data;
};
export const loginUser = async (username: string, password: string) => {
  const response = await defaultAxiosInstance.post("/v1/api/users/login", { username, password });
  return response.data;
};
export const addOrderItems = async (
  orderData: { items: { food_id: string; quantity: number }[]; created_by: string }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/orders", orderData);
  return response.data;
};
export const increaseOrderItemQuantity = async (food_id: string) => {
  const response = await defaultAxiosInstance.put(`/v1/api/orders/items/increase`, { food_id });
  return response.data;
};
export const decreaseOrderItemQuantity = async (food_id: string) => {
  const response = await defaultAxiosInstance.put(`/v1/api/orders/items/decrease`, { food_id });
  return response.data;
};
export const getApiCategories = async (
  searchCondition: { keyword: string; is_delete: boolean },
  pageInfo: { pageNum: number; pageSize: number }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/categories/search", { searchCondition, pageInfo });
  return response.data;
};
export const createCategory = async (
  categoryData: { name: string; description: string }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/categories", categoryData);
  return response.data;
};
export const deleteCategory = async (categoryId: string) => {
  const response = await defaultAxiosInstance.delete(`/v1/api/categories/${categoryId}`);
  return response.data;
};
export const getCategoryById = async (categoryId: string) => {
  const response = await defaultAxiosInstance.get(`/v1/api/categories/${categoryId}`);
  return response.data;
};
export const updateCategory = async (
  categoryId: string,
  categoryData: { name: string; description: string }
) => {
  const response = await defaultAxiosInstance.put(`/v1/api/categories/${categoryId}`, categoryData);
  return response.data;
};
export const getAPIFoods = async (
  searchCondition: { keyword: string; is_delete: boolean },
  pageInfo: { pageNum: number; pageSize: number }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/foods/search", { searchCondition, pageInfo });
  return response.data;
};
export const createFood = async (
  foodData: { name: string; category: string; price: number; description: string; image_url: string }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/foods", foodData);
  return response.data;
};
export const deleteFood = async (foodId: string) => {
  const response = await defaultAxiosInstance.delete(`/v1/api/foods/${foodId}`);
  return response.data;
};
export const getFoodById = async (foodId: string) => {
  const response = await defaultAxiosInstance.get(`/v1/api/foods/${foodId}`);
  return response.data;
};
export const updateFood = async (
  foodId: string,
  foodData: { name: string; category: string; price: number; description: string; image_url: string }
) => {
  const response = await defaultAxiosInstance.put(`/v1/api/foods/${foodId}`, foodData);
  return response.data;
};