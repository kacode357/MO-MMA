import { defaultAxiosInstance } from '@/config/axios.customize';

const CreatePurchaseApi = async (data: { user_id: string; package_id: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/purchases', data);
    return response;
};
const CheckPurchaseApi = async (data: { user_id: string; package_id: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/purchases/check', data);
    return response;
};
const SearchPurchaseApi = async (data: {
    searchCondition: { keyword: string; status: string, is_premium: boolean };
    pageInfo: { pageNum: number; pageSize: number };
}) => {
    const response = await defaultAxiosInstance.post('/v1/api/purchases/search', data);
    return response;
};
const UpgradePremiumPurchaseApi = async (data: { package_id: string }) => {
    const response = await defaultAxiosInstance.post('/v1/api/purchases/upgrade-premium', data);
    return response;
};
const CompletePurchaseApi = async (data: { purchase_id: string }) => {
    const response = await defaultAxiosInstance.post('/v1/api/purchases/complete', data);
    return response;
};
export { CheckPurchaseApi, CompletePurchaseApi, CreatePurchaseApi, SearchPurchaseApi, UpgradePremiumPurchaseApi };

