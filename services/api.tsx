import { defaultAxiosInstance } from "../utils/axios.customize";

export const getApiFood = async (
  searchCondition: { keyword: string; is_delete: boolean },
  pageInfo: { pageNum: number; pageSize: number }
) => {
  const response = await defaultAxiosInstance.post("/v1/api/foods/search", { searchCondition, pageInfo });
  return response.data;
};

export const addToCart = async (foodId: string, quantity: number) => {
  const response = await defaultAxiosInstance.post("/v1/api/cart", {
    foodId,
    quantity,
  });
  return response.data;
};
export const getCart = async () => {
  const response = await defaultAxiosInstance.get("/v1/api/cart");
  return response.data;
};
export const updateCart = async (foodId: string, quantity: number) => {
  const response = await defaultAxiosInstance.put("/v1/api/cart", {
    foodId,
    quantity,
  });
  return response.data;
};
export const deleteFromCart = async (foodId: string) => {
  const response = await defaultAxiosInstance.delete("/v1/api/cart", {
    data: { foodId },
  });
  return response.data;
};
export const clearCart = async () => {
  const response = await defaultAxiosInstance.delete("/v1/api/cart/clear");
  return response.data;
};
export const getCartById = async (cartId: string) => {
  const response = await defaultAxiosInstance.get(`/v1/api/cart/${cartId}`);
  return response.data;
};
export const createPayment = async (cartId: string, amountPaid: number) => {
  const response = await defaultAxiosInstance.post("/api/create-payment", {
    cartId,
    amountPaid,
  });

  return response.data;
};
export const createCashPayment = async (cartId: string, amountPaid: number) => {
  const response = await defaultAxiosInstance.post("/api/cash-payment", {
    cartId,
    amountPaid,
  });
  return response.data;
};