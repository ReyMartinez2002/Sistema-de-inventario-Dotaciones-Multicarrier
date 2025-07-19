export type UserRole = 'superadmin' | 'admin' | 'viewer';

export interface User {
  id: number;
  username: string;
  nombre: string;
  rol: UserRole;
  id_rol?: number;
  email?: string;
  token?: string;
}