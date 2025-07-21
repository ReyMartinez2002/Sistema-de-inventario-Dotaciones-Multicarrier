export class Api {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  }

  // Operaciones de autenticación
  get auth() {
    return {
      login: async (username: string, password: string) => {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error(await response.text());
        return response.json();
      },

      logout: async (token: string) => {
        const response = await fetch(`${this.baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al cerrar sesión");
        return response.json();
      },

      validateToken: async (token: string) => {
        const response = await fetch(`${this.baseUrl}/auth/validate`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Token inválido o expirado");
        return response.json();
      }
    };
  }

  // Operaciones de usuarios
  get users() {
    return {
      getAll: async (token: string) => {
        const response = await fetch(`${this.baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener usuarios");
        const data = await response.json();
        
        // Convertir estados string a booleanos
        return {
          ...data,
          data: data.data?.map((user: any) => ({
            ...user,
            estado: user.estado === 'activo'
          })) || []
        };
      },

      getById: async (id: number, token: string) => {
        const response = await fetch(`${this.baseUrl}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener usuario");
        const data = await response.json();
        
        // Convertir estado string a booleano
        return {
          ...data,
          data: {
            ...data.data,
            estado: data.data?.estado === 'activo'
          }
        };
      },

      create: async (userData: any, token: string) => {
        // Convertir estado booleano a string para el backend
        const payload = {
          ...userData,
          estado: userData.estado ? 'activo' : 'inactivo'
        };

        const response = await fetch(`${this.baseUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 409) {
          const errorData = await response.json();
          throw new Error(errorData.message || "El nombre de usuario ya existe");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al crear usuario");
        }

        const data = await response.json();
        
        // Convertir estado string a booleano en la respuesta
        return {
          ...data,
          data: {
            ...data.data,
            estado: data.data?.estado === 'activo'
          }
        };
      },

      update: async (id: number, userData: any, token: string) => {
        // Convertir estado booleano a string para el backend
        const payload = {
          ...userData,
          ...(userData.estado !== undefined && { 
            estado: userData.estado ? 'activo' : 'inactivo' 
          })
        };

        const response = await fetch(`${this.baseUrl}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) throw new Error("Error al actualizar usuario");
        
        const data = await response.json();
        
        // Convertir estado string a booleano en la respuesta
        return {
          ...data,
          data: {
            ...data.data,
            estado: data.data?.estado === 'activo'
          }
        };
      },

      delete: async (id: number, token: string) => {
        const response = await fetch(`${this.baseUrl}/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al eliminar usuario");
        return response.json();
      },

     changeStatus: async (id: number, status: 'activo' | 'inactivo', token: string) => {
        try {
          // Validación en el frontend
          if (!['activo', 'inactivo'].includes(status)) {
            throw new Error('El estado debe ser "activo" o "inactivo"');
          }

          const response = await fetch(`${this.baseUrl}/users/${id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ estado: status }),
          });

          if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No tienes permiso para esta acción');
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Error al cambiar estado");
          }

          return response.json();
        } catch (error) {
          console.error('Error en changeStatus:', error);
          throw error;
        }
      }
    }
  }
}