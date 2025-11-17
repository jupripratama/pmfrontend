import React, { useState, useEffect } from 'react';
import { rolePermissionApi, roleApi, permissionApi } from '../../services/api';
import { RolePermissionMatrix, Role, Permission } from '../../types/permission';
import { Save, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RolePermissionsTab() {
  const [matrix, setMatrix] = useState<RolePermissionMatrix[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changes, setChanges] = useState<{ [roleId: number]: { [permissionId: number]: boolean } }>({});

  // AMBIL USER YANG SEDANG LOGIN
  const { user } = useAuth();
  const isSuperAdmin = user?.roleName === "Super Admin";

  // HELPER: BISA EDIT ROLE SUPER ADMIN ATAU BUKAN?
  const canEditRole = (roleId: number): boolean => {
    return roleId !== 1 || isSuperAdmin;
  };

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
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memuat data' });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (roleId: number, permissionId: number): boolean => {
    if (changes[roleId]?.[permissionId] !== undefined) return changes[roleId][permissionId];
    const roleMatrix = matrix.find(m => m.roleId === roleId);
    const perm = roleMatrix?.permissions.find(p => p.permissionId === permissionId);
    return perm?.isAssigned === true;
  };

  const togglePermission = (roleId: number, permissionId: number) => {
    // Super Admin bisa toggle semua, termasuk role ID=1
    // Non-Super Admin tidak bisa toggle role ID=1 karena checkbox-nya disabled
    const current = hasPermission(roleId, permissionId);
    setChanges(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: !current,
      },
    }));
  };

  const hasChanges = () => Object.keys(changes).length > 0;

  const handleSaveChanges = async () => {
    if (!hasChanges()) return setMessage({ type: 'error', text: 'Tidak ada perubahan' });

    setSaving(true);
    try {
      for (const [roleIdStr, perms] of Object.entries(changes)) {
        const roleId = parseInt(roleIdStr);
        const current = matrix.find(m => m.roleId === roleId)?.permissions
          .filter(p => p.isAssigned).map(p => p.permissionId) || [];

        const updated = new Set(current);
        Object.entries(perms).forEach(([pid, enabled]) => {
          const id = parseInt(pid);
          enabled ? updated.add(id) : updated.delete(id);
        });

        await rolePermissionApi.assignPermissions(roleId, Array.from(updated));
      }

      setMessage({ type: 'success', text: 'Semua perubahan berhasil disimpan!' });
      setChanges({});
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (hasChanges() && !confirm('Batalkan semua perubahan?')) return;
    setChanges({});
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Permission Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">Kelola permission per role</p>
        </div>

        {hasChanges() && (
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button onClick={handleReset} disabled={saving} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <button onClick={handleSaveChanges} disabled={saving} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:bg-blue-400">
              {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}><X className="w-5 h-5" /></button>
        </div>
      )}

      {hasChanges() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800"><strong>Perhatian:</strong> Ada {Object.keys(changes).length} role dengan perubahan belum disimpan.</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r">
                Permission
              </th>
              {roles.map(role => (
                <th key={role.roleId} className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase">
                  <div className="space-y-1">
                    <div>{role.roleName}</div>
                    {role.roleId === 1 && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Super Admin</span>
                    )}
                    {changes[role.roleId] && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Modified</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map(permission => (
              <tr key={permission.permissionId} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-6 py-4 border-r whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{permission.permissionName}</div>
                    {permission.group && <div className="text-xs text-gray-500">{permission.group}</div>}
                  </div>
                </td>
                {roles.map(role => {
                  const checked = hasPermission(role.roleId, permission.permissionId);
                  const changed = changes[role.roleId]?.[permission.permissionId] !== undefined;
                  const editable = canEditRole(role.roleId);

                  return (
                    <td key={`${role.roleId}-${permission.permissionId}`} className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!editable}
                        onChange={() => togglePermission(role.roleId, permission.permissionId)}
                        className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 
                          ${!editable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                          ${changed ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                        `}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2"><input type="checkbox" checked disabled className="w-4 h-4" /><span>Granted</span></div>
        <div className="flex items-center gap-2"><input type="checkbox" disabled className="w-4 h-4" /><span>Not granted</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-yellow-500 rounded"></div><span>Unsaved change</span></div>
      </div>
    </div>
  );
}