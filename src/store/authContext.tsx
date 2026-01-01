import { createContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, LoginCredentials, SignupCredentials } from '../types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_ERROR'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_PROFILE_IMAGE'; payload: string }
    | { type: 'RESTORE_SESSION'; payload: User | null };

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, isLoading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                isAuthenticated: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null,
            };
        case 'UPDATE_PROFILE_IMAGE':
            return {
                ...state,
                user: state.user ? { ...state.user, profileImage: action.payload } : null,
            };
        case 'RESTORE_SESSION':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
            };
        default:
            return state;
    }
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Restore session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        if (storedUser && token) {
            try {
                const user = JSON.parse(storedUser);
                dispatch({ type: 'RESTORE_SESSION', payload: user });
            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const data = await authService.login(credentials.user_name, credentials.password);
            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const signup = useCallback(async (credentials: SignupCredentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const data = await authService.signup(credentials.user_name, credentials.password);
            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.'
            dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    }, []);

    const updateProfileImage = useCallback((imageUrl: string) => {
        dispatch({ type: 'UPDATE_PROFILE_IMAGE', payload: imageUrl });
    }, []);

    const updateProfile = useCallback(async (name: string) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const data = await authService.updateProfile(name);
            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Profil güncellenemedi.';
            dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            await authService.updatePassword(currentPassword, newPassword);
            dispatch({ type: 'LOGIN_ERROR', payload: '' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Şifre değiştirilemedi.';
            dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
            throw error;
        }
    }, []);

    const value: AuthContextType = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        signup,
        logout,
        updateProfileImage,
        updateProfile,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
