import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/roles`
  : 'http://localhost:3001/api/roles';

// Tipado para un rol (puedes mover a types/ si lo deseas)
export interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
}

// Obtener todos los roles
export const fetchRoles = async (): Promise<Role[]> => {
  const res = await axios.get<Role[]>(API_URL);
  return res.data;
};

// Crear nuevo rol
export const createRole = async (nombre: string, descripcion: string) => {
  return axios.post(API_URL, { nombre, descripcion });
};

// Actualizar rol existente
export const updateRole = async (id_rol: number, nombre: string, descripcion: string) => {
  return axios.put(`${API_URL}/${id_rol}`, { nombre, descripcion });
};

// (Opcional) Obtener un solo rol
export const fetchRoleById = async (id_rol: number) => {
  const res = await axios.get<Role>(`${API_URL}/${id_rol}`);
  return res.data;
};