import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../store/themeContext';
import type { SignupCredentials } from '../../types';
import styles from './SignupForm.module.css';

export const SignupForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<SignupCredentials>();
    const { signup, isLoading, error } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const onSubmit = async (data: SignupCredentials) => {
        if (data.password !== data.confirmPassword) {
            return;
        }

        try {
            await signup(data);
            navigate('/profile');
        } catch (err) {
            console.error('Signup error:', err);
        }
    };

    const password = watch('password');
    const confirmPassword = watch('confirmPassword');
    const user_name = watch('user_name');

    const isFormValid =
        user_name &&
        password &&
        confirmPassword &&
        !errors.user_name &&
        !errors.password &&
        !errors.confirmPassword &&
        password === confirmPassword;

    return (
        <div className={styles.container}>
            <button onClick={toggleTheme} className={styles.themeBtn} title={`${theme === 'dark' ? 'Açık' : 'Koyu'} tema`}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className={styles.formCard}>
                <h1 className={styles.title}>Kayıt Ol</h1>
                <p className={styles.subtitle}>Hesap oluşturmak için bilgilerinizi girin.</p>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="user_name" className={styles.label}>
                            Ad Soyad
                        </label>
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
                        <label htmlFor="password" className={styles.label}>
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            {...register('password', {
                                required: 'Şifre gereklidir',
                                minLength: {
                                    value: 6,
                                    message: 'Şifre en az 6 karakter olmalı',
                                },
                            })}
                        />
                        {errors.password && <span className={styles.error}>{errors.password.message}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Şifreyi Onayla
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                            {...register('confirmPassword', {
                                required: 'Şifre onayı gereklidir',
                                validate: (value) => value === password || 'Şifreler eşleşmiyor',
                            })}
                        />
                        {errors.confirmPassword && (
                            <span className={styles.error}>{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    {error && <div className={styles.errorAlert}>{error}</div>}

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
                    >
                        {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" className={styles.link}>
                        Giriş yapın
                    </Link>
                </p>
            </div>
        </div>
    );
};
