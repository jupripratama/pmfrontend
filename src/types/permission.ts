// types/permission.ts
export interface Permission {
  permissionId: number;
  permissionName: string;
  description?: string;
  createdAt?: string;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  createdAt?: string;
}

export interface RolePermission {
  rolePermissionId: number;
  roleId: number;
  permissionId: number;
  roleName?: string;
  permissionName?: string;
  createdAt?: string;
}

export interface RolePermissionMatrix {
  roleId: number;
  roleName: string;
  permissions: {
    permissionId: number;
    permissionName: string;
    hasPermission: boolean;
  }[];
}

export interface CreatePermissionRequest {
  permissionName: string;
  description?: string;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  roleId: number;
  permissionIds: number[];
}