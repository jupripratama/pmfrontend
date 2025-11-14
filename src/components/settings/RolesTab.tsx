// components/settings/RolesTab.tsx
import React, { useState, useEffect } from 'react';
import { roleApi } from '../../services/api';
import { Role } from '../../types/permission';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  Shield,
} from 'lucide-react';

export default function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data roles' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roleName.trim()) {
      setMessage({ type: 'error', text: 'Nama role tidak boleh kosong' });
      return;
    }

    try {
      if (editingId) {
        await roleApi.update(editingId, formData);
        setMessage({ type: 'success', text: 'Role berhasil diupdate' });
      } else {
        await roleApi.create(formData);
        setMessage({ type: 'success', text: 'Role berhasil ditambahkan' });
      }

      setFormData({ roleName: '', description: '' });
      setIsAddingNew(false);
      setEditingId(null);
      fetchRoles();

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menyimpan role',
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingId(role.roleId);
    setFormData({
      roleName: role.roleName,
      description: role.description || '',
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      return;
    }

    try {
      await roleApi.delete(id);
      setMessage({ type: 'success', text: 'Role berhasil dihapus' });
      fetchRoles();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menghapus role',
      });
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ roleName: '', description: '' });
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Roles</h2>
          <p className="text-sm text-gray-600 mt-1">Total: {roles.length} roles</p>
        </div>

        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Role
          </button>
        )}
      </div>

      {/* Message */}
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

      {/* Add/Edit Form */}
      {isAddingNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Role' : 'Add New Role'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Role description"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition inline-flex items-center"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm ? 'No roles found' : 'No roles yet'}
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.roleId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.roleName}</h3>
                    <p className="text-xs text-gray-500">ID: {role.roleId}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                {role.description || 'No description'}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {role.createdAt
                    ? new Date(role.createdAt).toLocaleDateString('id-ID')
                    : '-'}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.roleId)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}