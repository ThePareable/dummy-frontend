export interface User {
    id: string;
    user_name: string;
    profileImage?: string;
}

export interface LoginCredentials {
    user_name: string;
    password: string;
}

export interface SignupCredentials {
    user_name: string;
    password: string;
    confirmPassword: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    updateProfileImage: (imageUrl: string) => void;
    updateProfile: (name: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
