import { defaultAxiosInstance } from '@/config/axios.customize';

const CreateChatSessionApi = async (data: { package_id: string; title: string; }) => {
    const response = await defaultAxiosInstance.post('/v1/api/chat-sessions', data);
    return response;
};
const SendMessageApi = async (chatSessionId: string, data: { prompt: string; message_type: string; ai_source: string; }) => {
    const response = await defaultAxiosInstance.post(`/v1/api/chat-sessions/${chatSessionId}/message`, data);
    return response;
};
const SendImageMessageApi = async (chatSessionId: string, data: { prompt: string; message_type: string; ai_source: string; input_image: { mimeType: string; data: string; }; }) => {
    const response = await defaultAxiosInstance.post(`/v1/api/chat-sessions/${chatSessionId}/message`, data);
    return response;
};

export { CreateChatSessionApi, SendImageMessageApi, SendMessageApi };

