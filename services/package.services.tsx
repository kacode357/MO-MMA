import { defaultAxiosInstance } from '@/config/axios.customize';

// API tìm kiếm gói
const searchPackages = async (
  searchCondition: { keyword: string; is_delete: boolean; is_premium?: boolean }, // Thêm is_premium vào searchCondition
  pageInfo: { pageNum: number; pageSize: number }
) => {
  const response = await defaultAxiosInstance.post('/v1/api/packages/search', {
    searchCondition: {
      keyword: searchCondition.keyword,
      is_delete: searchCondition.is_delete,
      is_premium: searchCondition.is_premium, // Thêm is_premium vào request
    },
    pageInfo: {
      pageNum: pageInfo.pageNum,
      pageSize: pageInfo.pageSize,
    },
  });
  return response;
};

// API tạo gói mới
const createPackage = async (packageData: {
  package_name: string;
  description: string;
  img_url: string;
  price: number;
  user_id: string;
  is_premium?: boolean; // Thêm is_premium vào dữ liệu gửi lên
}) => {
  const response = await defaultAxiosInstance.post('/v1/api/packages', packageData);
  console.log('Create package response:', response.data);
  return response;
};

// API lấy thông tin gói theo ID
const getPackageById = async (id: string) => {
  const response = await defaultAxiosInstance.get(`/v1/api/packages/${id}`);
  return response;
};

// API cập nhật gói
const updatePackage = async (
  id: string,
  packageData: {
    package_name: string;
    description: string;
    price: number | string;
    img_url: string;
    user_id: string;
    is_premium?: boolean; // Thêm is_premium vào dữ liệu gửi lên
  }
) => {
  const response = await defaultAxiosInstance.put(`/v1/api/packages/${id}`, packageData);
  return response;
};

// API xóa gói (soft delete)
const deletePackage = async (id: string, data: { user_id: string }) => {
  const response = await defaultAxiosInstance.delete(`/v1/api/packages/${id}`, { data });
  return response;
};

// API kiểm tra quyền truy cập gói
const checkAccessPackage = async (user_id: string, package_id: string) => {
  const response = await defaultAxiosInstance.post(`/v1/api/packages/${package_id}/access`, { user_id, package_id });
  return response;
};

export { checkAccessPackage, createPackage, deletePackage, getPackageById, searchPackages, updatePackage };
