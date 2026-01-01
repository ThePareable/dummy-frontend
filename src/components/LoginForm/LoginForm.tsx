import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../store/themeContext';
import type { LoginCredentials } from '../../types';
import styles from './LoginForm.module.css';

export const LoginForm = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginCredentials>();
    const { login, isLoading, error } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginCredentials) => {
        try {
            await login(data);
            navigate('/profile');
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const user_name = watch('user_name');
    const password = watch('password');
    const isFormValid = user_name && password && !errors.user_name && !errors.password;

    return (
        <div className={styles.container}>
            <button onClick={toggleTheme} className={styles.themeBtn} title={`${theme === 'dark' ? 'Açık' : 'Koyu'} tema`}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className={styles.formCard}>
                <h1 className={styles.title}>Login</h1>
                <p className={styles.subtitle}>Welcome back! Please login to continue.</p>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="user_name" className={styles.label}>Ad Soyad</label>
                        <input
                            id="user_name"
                            type="text"
                            placeholder="Adınız ve soyadınız"
                            className={`${styles.input} ${errors.user_name ? styles.inputError : ''}`}
                            {...register('user_name', {
                                required: 'Ad soyad gereklidir',
                                minLength: {
                                    value: 3,
                                    message: 'Ad en az 3 karakter olmalı',
                                },
                            })}
                        />
                        {errors.user_name && <span className={styles.error}>{errors.user_name.message}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                    </div>

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Hesabınız yok mu?{' '}
                    <Link to="/signup" className={styles.link}>
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </div>
    );
};
