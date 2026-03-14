import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            baseURL: error.config?.baseURL
        });
        return Promise.reject(error);
    }
);
export const registerUser = async (user: any) => {
    const payload = {
        username: user.uname,
        email: user.email,
        password: user.psw
    };
    const response = await api.post('/api/auth/register', payload);
    return response.data.message;
};
export const loginUser = async (user: any) => {
    const payload = {
        username: user.uname,
        password: user.psw
    };
    const response = await api.post('/api/auth/login', payload);
    return response.data.message;
};
export const saveHistory = async (history: any) => {
    const response = await api.post('/api/history/save', history);
    return response.data;
};
export const getHistory = async (username: string) => {
    const response = await api.get(`/api/history/${username}`);
    return response.data;
};
export default api;

