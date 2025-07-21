export class Api {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  }

  // Operaciones de autenticación (igual)
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
        return response.json();
      },

      getById: async (id: number, token: string) => {
        const response = await fetch(`${this.baseUrl}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener usuario");
        return response.json();
      },

      create: async (userData: any, token: string) => {
        const response = await fetch(`${this.baseUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });

        if (response.status === 409) {
          // Captura el mensaje personalizado del backend (usuario duplicado)
          const errorData = await response.json();
          throw new Error(errorData.message || "El nombre de usuario ya existe");
        }

        if (!response.ok) {
          // Otros errores
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Error al crear usuario");
        }

        return response.json();
      },

      update: async (id: number, userData: any, token: string) => {
        const response = await fetch(`${this.baseUrl}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Error al actualizar usuario");
        return response.json();
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
        const response = await fetch(`${this.baseUrl}/users/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: status }),
        });
        if (!response.ok) throw new Error("Error al cambiar estado");
        return response.json();
      }
    };
  }
}
