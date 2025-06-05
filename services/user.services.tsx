import { defaultAxiosInstance } from '@/config/axios.customize';

const CreateUserApi = async (data: { full_name: string; username: string; password: string; email: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/users', data);
    return response;
};
const LoginUserApi = async (data: { username: string; password: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/users/login', data);
    return response;
};
const GetCurrentLoginApi = async () => {
    const response = await defaultAxiosInstance.get('/v1/api/users/current');
    return response;
};
const UpdateUserApi = async (data: { full_name: string; email: string; avatar_url: string; }) => {
    const response = await defaultAxiosInstance.put('/v1/api/users/', data);
    return response;
};
const ChangePasswordApi = async (data: { currentPassword: string; newPassword: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/users/password', data);
    return response;
};
export { ChangePasswordApi, CreateUserApi, GetCurrentLoginApi, LoginUserApi, UpdateUserApi };

