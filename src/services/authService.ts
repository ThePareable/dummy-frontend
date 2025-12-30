import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

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

// Mock data for development
const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: null,  // ← Varsayılan olarak resim yok (placeholder gösterilir)
};

const mockToken = 'mock-jwt-token-' + Date.now();

export const authService = {
    login: async (email: string, password: string) => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock authentication
        if (USE_MOCK_AUTH) {
            if (email === 'test@example.com' && password === 'password123') {
                const userData = { ...mockUser, email };
                localStorage.setItem('authToken', mockToken);
                localStorage.setItem('user', JSON.stringify(userData));
                return {
                    user: userData,
                    token: mockToken,
                };
            } else {
                throw {
                    response: {
                        data: {
                            message: 'Invalid email or password. Try test@example.com / password123',
                        },
                    },
                };
            }
        }

        // Real API call (when backend is ready)
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
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock authentication
        if (USE_MOCK_AUTH) {
            // Check if email already exists (mock validation)
            const existingEmails = ['test@example.com'];
            if (existingEmails.includes(email)) {
                throw {
                    response: {
                        data: {
                            message: 'Bu email zaten kayıtlı. Başka bir email deneyin.',
                        },
                    },
                };
            }

            // Create new user
            const newUser = {
                id: 'user-' + Date.now(),
                email,
                name,
                profileImage: null,
            };

            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            return {
                user: newUser,
                token: mockToken,
            };
        }

        // Real API call (when backend is ready)
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
        if (USE_MOCK_AUTH) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const storedUser = localStorage.getItem('user');
            return {
                user: storedUser ? JSON.parse(storedUser) : mockUser,
            };
        }

        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    updateProfileImage: async (formData: FormData) => {
        if (USE_MOCK_AUTH) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Simüle et: dosyadan base64 image URL'si oluştur
            const file = formData.get('image') as File;
            if (!file) {
                throw new Error('Dosya seçilmedi');
            }

            // Dosyayı oku ve data URL'ye dönüştür (gerçek resim!)
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    const mockImageUrl = reader.result as string; // Base64 format

                    // Saklı kullanıcıyı güncelle
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        user.profileImage = mockImageUrl;
                        localStorage.setItem('user', JSON.stringify(user));
                    }

                    resolve({ imageUrl: mockImageUrl });
                };

                reader.onerror = () => {
                    reject(new Error('Resim okunamadı'));
                };

                reader.readAsDataURL(file);
            });
        }

        const response = await apiClient.post('/auth/upload-profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateProfile: async (name: string) => {
        if (USE_MOCK_AUTH) {
            await new Promise((resolve) => setTimeout(resolve, 600));

            // Saklı kullanıcıyı güncelle
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.name = name;
                localStorage.setItem('user', JSON.stringify(user));
                return { user };
            }
            throw new Error('Kullanıcı bulunamadı');
        }

        const response = await apiClient.put('/auth/profile', { name });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
        if (USE_MOCK_AUTH) {
            await new Promise((resolve) => setTimeout(resolve, 600));

            // Mock: Eski şifreyi kontrol et
            if (currentPassword !== 'password123') {
                throw {
                    response: {
                        data: {
                            message: 'Mevcut şifre hatalı. Deneyin: password123',
                        },
                    },
                };
            }

            // Şifreyi güncelle (çerez/session'da değişecek)
            // Gerçek backend'de şifre hash'lenerek kaydedilir
            return { success: true, message: 'Şifre başarıyla değiştirildi' };
        }

        const response = await apiClient.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};
