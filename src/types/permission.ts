export interface Permission {
  permissionId: number;
  permissionName: string;
  description?: string;
  group?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ MATCH BACKEND PermissionStatusDto
export interface PermissionStatus {
  permissionId: number;
  permissionName: string;
  permissionGroup: string | null;
  isAssigned: boolean; // ✅ Backend uses isAssigned, NOT hasPermission
}

// ✅ MATCH BACKEND RolePermissionMatrixDto
export interface RolePermissionMatrix {
  roleId: number;
  roleName: string;
  roleDescription: string | null;
  isActive: boolean;
  permissions: PermissionStatus[];
}

export interface RolePermission {
  rolePermissionId: number;
  roleId: number;
  roleName: string;
  permissionId: number;
  permissionName: string;
  permissionGroup: string | null;
  createdAt: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePermissionRequest {
  permissionName: string;
  description?: string;
  group?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: number[];
}

export interface RoleDto {
  roleId: number;
  roleName: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
  createdAt?: string;
}

export interface PermissionDto {
  permissionId: number;
  permissionName: string;
  description?: string;
  group?: string;
  createdAt?: string;
}
