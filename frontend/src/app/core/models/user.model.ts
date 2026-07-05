export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export enum UserRole {
  Customer = 'Customer',
  Manager = 'Manager',
  Admin = 'Admin'
}

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; username: string; role: string; userId: number; expiresAt: string; }
export interface RegisterRequest { username: string; email: string; password: string; }
