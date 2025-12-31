import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    signup: async (email: string, password: string, name: string) => {
        try {
            const response = await apiClient.post('/auth/signup', { email, password, name });
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    updateProfileImage: async (formData: FormData) => {
        const response = await apiClient.post('/auth/upload-profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    updateProfile: async (name: string) => {
        const response = await apiClient.put('/auth/profile', { name });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};
