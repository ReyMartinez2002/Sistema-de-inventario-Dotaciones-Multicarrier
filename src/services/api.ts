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
  
  // Asegurar que el estado sea string
  return {
    ...data,
    data: data.data?.map((user: any) => ({
      ...user,
      estado: String(user.estado) // Forzar conversión a string
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
  const response = await fetch(`${this.baseUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData), // Enviar los datos sin transformación
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
  
  // Devolver los datos sin transformación
  return data;
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
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar usuario");
  }
  
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al cambiar estado");
  }

  return response.json();
}
    }
  }
}