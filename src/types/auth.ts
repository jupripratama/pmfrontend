export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  userId: number;
  roleId: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  permissions: string[];
}