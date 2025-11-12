// components/ProfilePage.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
      return;
    }

    setUploadingPhoto(true);
    setMessage(null);

    try {
      const response = await authApi.uploadProfilePhoto(file);
      
      // Update user data in localStorage
      const updatedUser = { ...user, photoUrl: response.photoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Foto profil berhasil diupdate' });
      
      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal mengupload foto',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate if changing password
    if (isChangingPassword) {
      if (!formData.password) {
        setMessage({ type: 'error', text: 'Password tidak boleh kosong' });
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setMessage({
          type: 'error',
          text: 'Password dan konfirmasi password tidak cocok',
        });
        setLoading(false);
        return;
      }
    }

    try {
      const updateData: any = {
        fullName: formData.fullName,
        email: formData.email,
      };

      if (isChangingPassword && formData.password) {
        updateData.password = formData.password;
      }

      await authApi.updateProfile(updateData);

      setMessage({ type: 'success', text: 'Profile berhasil diupdate' });
      setIsEditing(false);
      setIsChangingPassword(false);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal mengupdate profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    });
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Saya</h1>
          <p className="text-gray-600 mt-2">
            Kelola informasi profile dan keamanan akun Anda
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
              <div className="relative">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {getUserInitials()}
                  </div>
                )}

                {/* Upload Photo Button */}
                <button
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-lg disabled:bg-blue-400"
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Action Buttons */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save className="w-5 h-5 inline mr-2" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        isEditing
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        isEditing
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Username tidak dapat diubah
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.roleName || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Change Password Section */}
              {isEditing && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Ubah Password
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isChangingPassword ? 'Batal ubah password' : 'Ubah password'}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Baru
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Min. 6 karakter"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="Ketik ulang password"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Terdaftar sejak</p>
                      <p className="font-medium text-gray-900">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Login terakhir</p>
                      <p className="font-medium text-gray-900">
                        {user?.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}