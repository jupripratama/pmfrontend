export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
}