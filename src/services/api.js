import axios from 'axios';

const apiUrl = process.env.VUE_APP_API_URL;


const apiClient = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
    }
});

// 요청 인터셉터 수정
apiClient.interceptors.request.use(
  config => {
    console.log('API 요청:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers
    });
    
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
  response => {
    console.log('API 응답 성공:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API 응답 오류:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
export default {
    getHello(){
        return apiClient.get('/api/hello');
    }
}