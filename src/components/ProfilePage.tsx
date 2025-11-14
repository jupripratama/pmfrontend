// components/ProfilePage.tsx - FINAL + LENGKAP + ADA GANTI PASSWORD!
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Calendar, Camera, Save, X, Eye, EyeOff, Lock,
  Trash2, CheckCircle, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';

export default function ProfilePage() {
  const { user: contextUser, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(contextUser);
  const [photoError, setPhotoError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', oldPassword: '', newPassword: '', confirmPassword: ''
  });

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load & sync user
  useEffect(() => { if (contextUser) refreshUserData(); }, []);
  useEffect(() => { if (contextUser) setCurrentUser(contextUser); }, [contextUser]);
  useEffect(() => {
    if (!isEditing && currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        oldPassword: '', newPassword: '', confirmPassword: ''
      });
      setIsChangingPassword(false);
      setShowPassword({ old: false, new: false, confirm: false });
    }
  }, [isEditing, currentUser]);

  // Multi-tab sync
  useEffect(() => {
    const handler = () => {
      const u = localStorage.getItem('user');
      if (u) { try { setCurrentUser(JSON.parse(u)); setPhotoError(false); } catch {} }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!contextUser?.userId) return;
    setRefreshing(true);
    try {
      const fresh = await authApi.getProfile();
      setCurrentUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
      setPhotoError(false);
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat profil' });
    } finally {
      setRefreshing(false);
    }
  }, [contextUser]);

  const getInitials = () => {
    if (!currentUser?.fullName) return 'U';
    const names = currentUser.fullName.trim().split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.userId) return;

    if (!file.type.startsWith('image/')) return setMessage({ type: 'error', text: 'File harus gambar' });
    if (file.size > 5 * 1024 * 1024) return setMessage({ type: 'error', text: 'Maksimal 5MB' });

    setUploadingPhoto(true);
    try {
      await authApi.uploadProfilePhoto(currentUser.userId, file);
      await refreshUserData();
      setMessage({ type: 'success', text: 'Foto profil diperbarui!' });
    } catch {
      setMessage({ type: 'error', text: 'Gagal upload foto' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentUser?.userId || !currentUser.photoUrl || !confirm('Hapus foto?')) return;
    setUploadingPhoto(true);
    try {
      await authApi.deleteProfilePhoto(currentUser.userId);
      await refreshUserData();
      setMessage({ type: 'success', text: 'Foto dihapus' });
    } catch {
      setMessage({ type: 'error', text: 'Gagal hapus foto' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.userId) return;

    setLoading(true);
    setMessage(null);

    try {
      let hasChanges = false;

      // Update nama & email
      if (formData.fullName !== currentUser.fullName || formData.email !== currentUser.email) {
        await authApi.updateProfile(currentUser.userId, {
          fullName: formData.fullName,
          email: formData.email,
        });
        hasChanges = true;
      }

      // Ganti password
      if (isChangingPassword && formData.newPassword) {
        if (formData.newPassword.length < 8) throw new Error('Password minimal 8 karakter');
        if (formData.newPassword !== formData.confirmPassword) throw new Error('Password tidak cocok');
        await authApi.changePassword(formData.oldPassword, formData.newPassword);
        hasChanges = true;
      }

      if (!hasChanges) {
        setMessage({ type: 'error', text: 'Tidak ada perubahan' });
        setLoading(false);
        return;
      }

      await refreshUserData();
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menyimpan perubahan' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasPhoto = currentUser.photoUrl && !photoError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Profil Saya
          </h1>
          <p className="text-gray-600 mt-2">Kelola informasi dan keamanan akun Anda</p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-5 rounded-2xl flex items-center gap-3 shadow-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-5 h-5" /></button>
          </motion.div>
        )}

        {/* Card Utama */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Gradient Header */}
          <div className="h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative px-8 pb-10">
            {/* Avatar + Tombol (POJOK KANAN BAWAH, HANYA HOVER) */}
            <div className="absolute -top-20 left-8 group">
              <div className="relative">
                {hasPhoto ? (
                  <motion.img
                    key={currentUser.photoUrl}
                    src={currentUser.photoUrl}
                    alt={currentUser.fullName}
                    onError={() => setPhotoError(true)}
                    onClick={handleAvatarClick}
                    className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-2xl cursor-pointer transition-transform group-hover:scale-105"
                  />
                ) : (
                  <motion.div
                    onClick={handleAvatarClick}
                    className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold border-8 border-white shadow-2xl cursor-pointer transition-transform group-hover:scale-105"
                  >
                    {getInitials()}
                  </motion.div>
                )}

                {/* Tombol Upload & Hapus */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); handleAvatarClick(); }}
                    disabled={uploadingPhoto}
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50"
                    title="Ganti Foto"
                  >
                    {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </motion.button>

                  {currentUser.photoUrl && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDeletePhoto(); }}
                      disabled={uploadingPhoto}
                      className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 disabled:opacity-50"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

            {/* User Info */}
            <div className="pt-24 text-center md:text-left md:ml-52">
              <h2 className="text-3xl font-bold text-gray-900">{currentUser.fullName}</h2>
              <p className="text-gray-600 mt-1">{currentUser.email}</p>
              <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {currentUser.roleName}
                </span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-center md:justify-end gap-3 mt-8">
              <button
                onClick={refreshUserData}
                disabled={refreshing}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex items-center gap-2 font-medium"
              >
                {refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Refresh
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition font-semibold"
              >
                {isEditing ? 'Batal Edit' : 'Edit Profil'}
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          {/* FORM EDIT */}
          {isEditing && (
            <div className="px-8 pb-10 border-t border-gray-100 pt-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* UBAH PASSWORD — INI YANG KAMU CARI! */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Ubah Password
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {isChangingPassword ? 'Batal' : 'Ganti password'}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <div className="space-y-5 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword.old ? 'text' : 'password'}
                            value={formData.oldPassword}
                            onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                            className="w-full pl-12 pr-14 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            placeholder="Masukkan password lama"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword.new ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                              className="w-full pl-12 pr-14 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                              placeholder="Min. 8 karakter"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword.confirm ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="w-full pl-12 pr-14 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                              placeholder="Ketik ulang"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl transition font-bold text-lg flex items-center gap-3 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Simpan Semua Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Informasi Akun */}
          <div className="px-8 pb-10 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Informasi Akun</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-gray-500">Terdaftar sejak</p>
                  <p className="font-semibold text-gray-900">{formatDate(currentUser.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-gray-500">Login terakhir</p>
                  <p className="font-semibold text-gray-900">
                    {currentUser.lastLogin ? formatDate(currentUser.lastLogin) : 'Belum pernah'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}