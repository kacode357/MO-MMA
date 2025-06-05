import { defaultAxiosInstance } from '@/config/axios.customize';

const CreatePaymentApi = async (data: {
  user_id: string;
  purchase_id: string;
  amount: number;
  payment_method: string;
}) => {
  const response = await defaultAxiosInstance.post('/v1/api/payments', data);
  return response;
};

const CheckPaymentApi = async (data: {
  user_id: string;
  payment_id?: string;
  reference_code?: string;
}) => {
  const response = await defaultAxiosInstance.post('/v1/api/payments/check', data);
  return response;
};

export { CheckPaymentApi, CreatePaymentApi };
