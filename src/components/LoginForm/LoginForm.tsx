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

    const email = watch('email');
    const password = watch('password');
    const isFormValid = email && password && !errors.email && !errors.password;

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
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Please enter a valid email',
                                },
                            })}
                        />
                        {errors.email && <span className={styles.error}>{errors.email.message}</span>}
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
                    Demo credentials: test@example.com / password123
                </p>

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
