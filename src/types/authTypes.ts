export type UserRole = 'superadmin' | 'admin' | 'viewer';

export interface User {
  id: number;
  username: string;
  nombre: string;
  rol: UserRole;
  id_rol: number;
  email: string;
  token: string;
  foto?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}