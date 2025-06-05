import { defaultAxiosInstance } from '@/config/axios.customize';

const CreateGroupMemberApi = async (data: { group_id: string; user_id: string; owner_id: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/group-members', data);
    return response;
};
const SearchGroupMembersApi = async (data: { group_id: string; keyword: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/group-members/search', data);
    return response;
};
const DeleteGroupMemberApi = async (data: { group_id: string; user_id: string; }) => {
    const response = await defaultAxiosInstance.delete('/v1/api/group-members', { data });
    return response;
};
const SearchUsersApi = async (keyword: string) => {
  const response = await defaultAxiosInstance.post('/v1/api/users/search', { keyword });
  return response;
};
export { CreateGroupMemberApi, DeleteGroupMemberApi, SearchGroupMembersApi, SearchUsersApi };

