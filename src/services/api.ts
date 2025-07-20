export class Api {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  }

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
            Authorization: `Bearer ${token}` 
          },
        });
        if (!response.ok) throw new Error("Error al cerrar sesión");
      },

      validateToken: async (token: string) => {
        const response = await fetch(`${this.baseUrl}/auth/validate`, {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
        if (!response.ok) throw new Error("Token inválido o expirado");
        return response.json();
      }
    };
  }
}