import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

interface ErrorResponse {
  type?: string;
  title?: string;
  status: number;
  message?: string;
  errors?: { message?: string }[];
}

// Default Axios instance with loading effect
const defaultAxiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "content-type": "application/json",
  },
  timeout: 30000,
  timeoutErrorMessage: "Connection timeout exceeded",
});

defaultAxiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

defaultAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (err: AxiosError<ErrorResponse>) => {
    const { response } = err;
    if (response) {
      handleErrorByNotification(err);
    }
    return Promise.reject(err);
  }
);

// Error handler
const handleErrorByNotification = (errors: AxiosError<ErrorResponse>) => {
  const data = errors.response?.data as ErrorResponse;
  const errorMessage = data?.message || data?.title;
  
  return errorMessage;
};

export { defaultAxiosInstance };

