import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../store/themeContext';
import { authService } from '../../services/authService';
import styles from './ProfileHeader.module.css';

export const ProfileHeader = () => {
    const { user, logout, updateProfileImage, updateProfile, updatePassword, isLoading, error } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profil bilgisi form
    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors },
        reset: resetProfile,
    } = useForm({
        defaultValues: {
            name: user?.user_name || '',
        },
    });

    // Şifre form
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        watch: watchPassword,
        reset: resetPassword,
    } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setUploadError(null);
    };

    const handleUploadImage = async () => {
        if (!previewImage || !fileInputRef.current?.files?.[0]) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', fileInputRef.current.files[0]);

            const response = await authService.updateProfileImage(formData);
            updateProfileImage(response.imageUrl);
            setPreviewImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setUploadError(null);
        } catch (error: any) {
            setUploadError(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelPreview = () => {
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onProfileSubmit = async (data: any) => {
        try {
            await updateProfile(data.name);
            setEditMode(false);
        } catch (err) {
            console.error('Profil güncellenemedi:', err);
        }
    };

    const onPasswordSubmit = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            return;
        }

        try {
            await updatePassword(data.currentPassword, data.newPassword);
            resetPassword();
            setShowPasswordForm(false);
            alert('Şifre başarıyla değiştirildi!');
        } catch (err) {
            console.error('Şifre değiştirilemedi:', err);
        }
    };

    const newPassword = watchPassword('newPassword');
    const confirmPassword = watchPassword('confirmPassword');
    const currentPassword = watchPassword('currentPassword');

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Profiliniz</h1>
                    <div className={styles.headerActions}>
                        <button onClick={toggleTheme} className={styles.themeBtn} title={`${theme === 'dark' ? 'Açık' : 'Koyu'} tema`}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Çıkış
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Profil Resmi Bölümü */}
                    <div className={styles.imageSection}>
                        <div className={styles.imageContainer}>
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Önizleme"
                                    className={styles.profileImage}
                                />
                            ) : user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profil"
                                    className={styles.profileImage}
                                />
                            ) : (
                                <div className={styles.placeholderImage}>
                                    <span>📷</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.imageUploadArea}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className={styles.hiddenInput}
                                id="image-input"
                            />
                            <label htmlFor="image-input" className={styles.uploadLabel}>
                                Görüntü Seç
                            </label>

                            {previewImage && (
                                <div className={styles.previewActions}>
                                    <button
                                        onClick={handleUploadImage}
                                        disabled={isUploading}
                                        className={styles.uploadBtn}
                                    >
                                        {isUploading ? 'Yükleniyor...' : 'Yükle'}
                                    </button>
                                    <button
                                        onClick={handleCancelPreview}
                                        disabled={isUploading}
                                        className={styles.cancelBtn}
                                    >
                                        İptal
                                    </button>
                                </div>
                            )}

                            {uploadError && (
                                <p className={styles.errorMessage}>{uploadError}</p>
                            )}
                        </div>
                    </div>

                    {/* Hesap Bilgileri Bölümü */}
                    <div className={styles.infoSection}>
                        {editMode ? (
                            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className={styles.editForm}>
                                <h2 className={styles.sectionTitle}>Profili Düzenle</h2>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Ad Soyad</label>
                                    <input
                                        type="text"
                                        placeholder="Adınızı girin"
                                        className={`${styles.input} ${profileErrors.name ? styles.inputError : ''}`}
                                        {...registerProfile('name', {
                                            required: 'Ad soyad gereklidir',
                                            minLength: {
                                                value: 2,
                                                message: 'Ad en az 2 karakter olmalı',
                                            },
                                        })}
                                    />
                                    {profileErrors.name && (
                                        <span className={styles.error}>{profileErrors.name.message}</span>
                                    )}
                                </div>

                                {error && <div className={styles.errorAlert}>{error}</div>}

                                <div className={styles.formActions}>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={styles.submitBtn}
                                    >
                                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMode(false);
                                            resetProfile();
                                        }}
                                        className={styles.cancelEditBtn}
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className={styles.infoHeader}>
                                    <h2 className={styles.sectionTitle}>Hesap Bilgileri</h2>
                                    <button
                                        onClick={() => {
                                            setEditMode(true);
                                            resetProfile();
                                        }}
                                        className={styles.editBtn}
                                    >
                                        ✏️ Düzenle
                                    </button>
                                </div>

                                <div className={styles.infoGroup}>
                                    <label className={styles.infoLabel}>Ad Soyad</label>
                                    <p className={styles.infoValue}>{user?.user_name || 'N/A'}</p>
                                </div>

                                <div className={styles.infoGroup}>
                                    <label className={styles.infoLabel}>Kullanıcı ID</label>
                                    <p className={styles.infoValue}>{user?.id || 'N/A'}</p>
                                </div>
                            </>
                        )}

                        {/* Şifre Değiştirme Bölümü */}
                        {!editMode && (
                            <>
                                {showPasswordForm ? (
                                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className={styles.editForm}>
                                        <h2 className={styles.sectionTitle}>Şifre Değiştir</h2>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Mevcut Şifre</label>
                                            <input
                                                type="password"
                                                placeholder="Mevcut şifrenizi girin"
                                                className={`${styles.input} ${passwordErrors.currentPassword ? styles.inputError : ''
                                                    }`}
                                                {...registerPassword('currentPassword', {
                                                    required: 'Mevcut şifre gereklidir',
                                                })}
                                            />
                                            {passwordErrors.currentPassword && (
                                                <span className={styles.error}>{passwordErrors.currentPassword.message}</span>
                                            )}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Yeni Şifre</label>
                                            <input
                                                type="password"
                                                placeholder="Yeni şifre girin"
                                                className={`${styles.input} ${passwordErrors.newPassword ? styles.inputError : ''
                                                    }`}
                                                {...registerPassword('newPassword', {
                                                    required: 'Yeni şifre gereklidir',
                                                    minLength: {
                                                        value: 6,
                                                        message: 'Şifre en az 6 karakter olmalı',
                                                    },
                                                })}
                                            />
                                            {passwordErrors.newPassword && (
                                                <span className={styles.error}>{passwordErrors.newPassword.message}</span>
                                            )}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Yeni Şifreyi Onayla</label>
                                            <input
                                                type="password"
                                                placeholder="Yeni şifreyi tekrar girin"
                                                className={`${styles.input} ${passwordErrors.confirmPassword ? styles.inputError : ''
                                                    }`}
                                                {...registerPassword('confirmPassword', {
                                                    required: 'Şifreyi onaylamalısınız',
                                                    validate: (value) =>
                                                        value === newPassword || 'Şifreler eşleşmiyor',
                                                })}
                                            />
                                            {passwordErrors.confirmPassword && (
                                                <span className={styles.error}>{passwordErrors.confirmPassword.message}</span>
                                            )}
                                        </div>

                                        {error && <div className={styles.errorAlert}>{error}</div>}

                                        <div className={styles.formActions}>
                                            <button
                                                type="submit"
                                                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                                                className={styles.submitBtn}
                                            >
                                                {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    resetPassword();
                                                }}
                                                className={styles.cancelEditBtn}
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className={styles.changePasswordBtn}
                                    >
                                        🔐 Şifre Değiştir
                                    </button>
                                )}

                                {/* Divider Aşağı */}
                                <div className={styles.divider}></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
