import { defaultAxiosInstance } from '@/config/axios.customize';

const CreateGroupApi = async (data: { group_name: string; owner_id: string; package_id: string; purchase_id: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/groups', data);
    return response;
};
const GetAllGroupsApi = async (data: {
    searchCondition: { keyword: string; status: string };
    pageInfo: { pageNum: number; pageSize: number };
}) => {
    const response = await defaultAxiosInstance.post('/v1/api/groups/search', data);
    return response;
};
const GetGroupByIdApi = async (groupId: string) => {
    const response = await defaultAxiosInstance.get(`/v1/api/groups/${groupId}`);
    return response;
};

export { CreateGroupApi, GetAllGroupsApi, GetGroupByIdApi };

