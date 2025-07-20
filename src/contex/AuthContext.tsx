import { createContext } from "react";
import type { User } from "../types/types";

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);