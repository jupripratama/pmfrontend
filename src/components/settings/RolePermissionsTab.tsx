// components/settings/RolePermissionsTab.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { rolePermissionApi, roleApi, permissionApi } from '../../services/api';
import { RolePermissionMatrix, Role, Permission } from '../../types/permission';
import { Save, RefreshCw, X } from 'lucide-react';

export default function RolePermissionsTab() {
  const [matrix, setMatrix] = useState<RolePermissionMatrix[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [changes, setChanges] = useState<{
    [roleId: number]: { [permissionId: number]: boolean };
  }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matrixData, rolesData, permissionsData] = await Promise.all([
        rolePermissionApi.getMatrix(),
        roleApi.getAll(),
        permissionApi.getAll(),
      ]);

      setMatrix(matrixData);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setChanges({});
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (roleId: number, permissionId: number): boolean => {
    if (changes[roleId]?.[permissionId] !== undefined) {
      return changes[roleId][permissionId];
    }

    const roleMatrix = matrix.find((m) => m.roleId === roleId);
    if (!roleMatrix) return false;

    const permission = roleMatrix.permissions.find((p) => p.permissionId === permissionId);
    return permission?.hasPermission || false;
  };

  const togglePermission = (roleId: number, permissionId: number) => {
    const currentValue = hasPermission(roleId, permissionId);

    setChanges((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: !currentValue,
      },
    }));
  };

  const hasChanges = () => {
    return Object.keys(changes).length > 0;
  };

  const handleSaveChanges = async () => {
    if (!hasChanges()) {
      setMessage({ type: 'error', text: 'Tidak ada perubahan untuk disimpan' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      for (const [roleIdStr, permissionChanges] of Object.entries(changes)) {
        const roleId = parseInt(roleIdStr);
        
        // Get current permissions for this role from matrix
        const roleMatrix = matrix.find((m) => m.roleId === roleId);
        const currentPermissions = roleMatrix?.permissions
          .filter((p) => p.hasPermission)
          .map((p) => p.permissionId) || [];

        // Merge with changes
        const updatedPermissionIds = new Set(currentPermissions);
        
        Object.entries(permissionChanges).forEach(([permissionIdStr, hasPermission]) => {
          const permissionId = parseInt(permissionIdStr);
          if (hasPermission) {
            updatedPermissionIds.add(permissionId);
          } else {
            updatedPermissionIds.delete(permissionId);
          }
        });

        // Call API dengan permissionIds yang sudah diupdate
        await rolePermissionApi.assignPermissions(roleId, Array.from(updatedPermissionIds));
      }

      setMessage({
        type: 'success',
        text: 'Semua perubahan berhasil disimpan',
      });
      setChanges({});
      await fetchData();

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menyimpan perubahan',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (hasChanges() && !confirm('Apakah Anda yakin ingin membatalkan semua perubahan?')) {
      return;
    }
    setChanges({});
    setMessage(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Role Permission Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">
            Assign permissions to roles using checkboxes
          </p>
        </div>

        {hasChanges() && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleReset}
              disabled={saving}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition inline-flex items-center disabled:opacity-50"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center disabled:bg-blue-400"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <p className="flex-1">{message.text}</p>
          <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {hasChanges() && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Unsaved Changes:</strong> You have {Object.keys(changes).length} role(s) with
            pending changes. Click <strong>Save Changes</strong> to apply.
          </p>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border-r border-gray-200 min-w-[200px]">
                Permission / Role
              </th>
              {roles.map((role) => (
                <th
                  key={role.roleId}
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase min-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <span>{role.roleName}</span>
                    {Object.keys(changes[role.roleId] || {}).length > 0 && (
                      <span className="mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Changed
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={roles.length + 1} className="px-4 py-8 text-center text-gray-500">
                  No permissions available
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission.permissionId} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-3 border-r border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {permission.permissionName}
                      </p>
                      {permission.description && (
                        <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                      )}
                    </div>
                  </td>
                  {roles.map((role) => {
                    const checked = hasPermission(role.roleId, permission.permissionId);
                    const isChanged =
                      changes[role.roleId]?.[permission.permissionId] !== undefined;

                    return (
                      <td
                        key={`${role.roleId}-${permission.permissionId}`}
                        className="px-4 py-3 text-center"
                      >
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(role.roleId, permission.permissionId)}
                            className={`w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer ${
                              isChanged ? 'ring-2 ring-yellow-500' : ''
                            }`}
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={true} disabled className="w-4 h-4 text-blue-600" />
          <span>Permission assigned</span>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={false} disabled className="w-4 h-4" />
          <span>Permission not assigned</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
          <span>Unsaved change</span>
        </div>
      </div>
    </div>
  );
}