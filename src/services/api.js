import axios from 'axios';

// const apiUrl = process.env.VUE_APP_API_URL;
const apiUrl = "https://13.209.15.189";


const apiClient = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
    }
});

// frontend/src/services/api.js에 추가
apiClient.interceptors.request.use(
  config => {
    console.log('요청 URL:', config.baseURL + config.url);
    console.log('요청 메서드:', config.method.toUpperCase());
    console.log('요청 헤더:', config.headers);
    console.log('요청 데이터:', config.data);
    
    // 원래 있던 토큰 추가 로직
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터도 추가
apiClient.interceptors.response.use(
  response => {
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    return response;
  },
  error => {
    console.error('응답 오류:', error.response ? error.response.status : error.message);
    return Promise.reject(error);
  }
);
export default {
    getHello(){
        return apiClient.get('/api/hello');
    }
}