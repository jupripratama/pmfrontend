// components/settings/PermissionsTab.tsx
import React, { useState, useEffect } from 'react';
import { permissionApi } from '../../services/api';
import { Permission } from '../../types/permission';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
} from 'lucide-react';

export default function PermissionsTab() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    permissionName: '',
    description: '',
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await permissionApi.getAll();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data permissions' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.permissionName.trim()) {
      setMessage({ type: 'error', text: 'Nama permission tidak boleh kosong' });
      return;
    }

    try {
      if (editingId) {
        await permissionApi.update(editingId, formData);
        setMessage({ type: 'success', text: 'Permission berhasil diupdate' });
      } else {
        await permissionApi.create(formData);
        setMessage({ type: 'success', text: 'Permission berhasil ditambahkan' });
      }

      setFormData({ permissionName: '', description: '' });
      setIsAddingNew(false);
      setEditingId(null);
      fetchPermissions();

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menyimpan permission',
      });
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingId(permission.permissionId);
    setFormData({
      permissionName: permission.permissionName,
      description: permission.description || '',
    });
    setIsAddingNew(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus permission ini?')) {
      return;
    }

    try {
      await permissionApi.delete(id);
      setMessage({ type: 'success', text: 'Permission berhasil dihapus' });
      fetchPermissions();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menghapus permission',
      });
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ permissionName: '', description: '' });
  };

  const filteredPermissions = permissions.filter(
    (p) =>
      p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h2 className="text-xl font-bold text-gray-900">Manage Permissions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {permissions.length} permissions
          </p>
        </div>

        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Permission
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
            {editingId ? 'Edit Permission' : 'Add New Permission'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permission Name *
                </label>
                <input
                  type="text"
                  value={formData.permissionName}
                  onChange={(e) =>
                    setFormData({ ...formData, permissionName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ViewReports"
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
                  placeholder="Permission description"
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
            placeholder="Search permissions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Permissions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Permission Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Created At
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No permissions found' : 'No permissions yet'}
                </td>
              </tr>
            ) : (
              filteredPermissions.map((permission) => (
                <tr key={permission.permissionId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {permission.permissionId}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {permission.permissionName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {permission.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {permission.createdAt
                      ? new Date(permission.createdAt).toLocaleDateString('id-ID')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(permission)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(permission.permissionId)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}