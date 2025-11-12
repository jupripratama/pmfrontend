// components/settings/UsersManagementTab.tsx
import React, { useState, useEffect } from 'react';
import { userApi, roleApi } from '../../services/api';
import { User } from '../../types/auth';
import { Role } from '../../types/permission';
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function UsersManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>(
    'all'
  );
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        userApi.getAll(),
        roleApi.getAll(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data users' });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId: number) => {
    if (!confirm('Aktifkan user ini?')) {
      return;
    }

    try {
      await userApi.activateUser(userId);
      setMessage({ type: 'success', text: 'User berhasil diaktifkan' });
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal mengaktifkan user',
      });
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm('Nonaktifkan user ini?')) {
      return;
    }

    try {
      await userApi.deactivateUser(userId);
      setMessage({ type: 'success', text: 'User berhasil dinonaktifkan' });
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menonaktifkan user',
      });
    }
  };

  const handleChangeRole = async (userId: number, newRoleId: number) => {
    if (!confirm('Ubah role user ini?')) {
      return;
    }

    try {
      await userApi.updateRole(userId, newRoleId);
      setMessage({ type: 'success', text: 'Role user berhasil diubah' });
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal mengubah role',
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          Kelola aktivasi dan role pengguna
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Total Users</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Active Users</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">Inactive Users</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {stats.inactive}
          </p>
        </div>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Last Login
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        @{user.username}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={user.roleId}
                      onChange={(e) =>
                        handleChangeRole(user.userId, parseInt(e.target.value))
                      }
                      className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {roles.map((role) => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivate(user.userId)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Deactivate User"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.userId)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Activate User"
                        >
                          <UserCheck className="w-5 h-5" />
                        </button>
                      )}
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