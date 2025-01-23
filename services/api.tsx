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