// Configures Axios instances for Django and Node backends
// Injects JWT tokens into requests and handles 401 unauth responses
import axios from 'axios';

export const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const nodeApi = axios.create({
    baseURL: (import.meta.env.VITE_NODE_URL || 'http://localhost:5000')+'/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
        }
        return Promise.reject(error);
    }
);

export default api;