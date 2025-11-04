import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  roleName: string;
  roleId: number;
  isActive?: boolean; // Made optional to match User interface
  createdAt?: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await authApi.getProfile();
      setProfileData(profile);
      setEditForm({
        fullName: profile.fullName,
        email: profile.email,
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Gagal memuat profil" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form
      setEditForm({
        fullName: profileData?.fullName || "",
        email: profileData?.email || "",
      });
    }
    setIsEditing(!isEditing);
    setMessage(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Validasi
      if (!editForm.fullName.trim()) {
        setMessage({ type: "error", text: "Nama lengkap tidak boleh kosong" });
        return;
      }

      if (!editForm.email.trim()) {
        setMessage({ type: "error", text: "Email tidak boleh kosong" });
        return;
      }

      // Simulasi API call - ganti dengan actual API endpoint
      // await updateProfile(editForm);
      
      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          fullName: editForm.fullName,
          email: editForm.email,
        });
      }

      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setIsEditing(false);

      // Reload profile from server
      setTimeout(() => loadProfile(), 1000);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: error.message || "Gagal menyimpan perubahan" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Profil Saya
          </h1>
          <p className="text-gray-600">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </motion.div>

        {/* Alert Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Cover & Avatar Section */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
            <div className="absolute -bottom-16 sm:-bottom-20 left-6 sm:left-8">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1 shadow-xl"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                    {profileData?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                </motion.div>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-all flex items-center gap-2 shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profil</span>
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isSaving ? "Menyimpan..." : "Simpan"}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Batal</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 sm:pt-24 pb-8 px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-600">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Nama Lengkap
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {profileData?.fullName || "N/A"}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-600">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Username
                </label>
                <p className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                  {profileData?.username || "N/A"}
                </p>
                <p className="text-xs text-gray-500 ml-1">
                  Username tidak dapat diubah
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-600">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Masukkan email"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg break-all">
                    {profileData?.email || "N/A"}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-600">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  Role
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">
                    {profileData?.roleName || "N/A"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profileData?.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {profileData?.isActive ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>

              {/* Created At */}
              {profileData?.createdAt && (
                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Bergabung Sejak
                  </label>
                  <p className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {formatDate(profileData.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status Akun</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profileData?.isActive !== undefined 
                    ? (profileData.isActive ? "Aktif" : "Nonaktif")
                    : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Role ID</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profileData?.roleId || "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Akses Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profileData?.roleId === 1
                    ? "Super"
                    : profileData?.roleId === 2
                    ? "Admin"
                    : "User"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;