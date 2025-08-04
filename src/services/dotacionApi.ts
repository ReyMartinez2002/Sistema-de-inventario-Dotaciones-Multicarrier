// src/services/dotacionApi.ts
import type {
  Articulo,
  ArticuloForm,
  TallaData,
  Categoria,
  Subcategoria
} from "../types/Dotacion";

export class DotacionApi {
  private baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    token: string,
    body?: object
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en ${method} ${endpoint}: ${errorText}`);
    }

    return response.json();
  }

  // Métodos para GestionarTiposDotacion
  getCategorias(token: string): Promise<Categoria[]> {
    return this.request("/dotaciones/categorias", "GET", token);
  }

  getSubcategorias(token: string, idCategoria?: number): Promise<Subcategoria[]> {
    const endpoint = idCategoria 
      ? `/dotaciones/subcategorias/${idCategoria}`
      : "/dotaciones/subcategorias";
    return this.request(endpoint, "GET", token);
  }

  getArticulos(token: string, idSubcategoria?: number): Promise<Articulo[]> {
    const endpoint = idSubcategoria
      ? `/dotaciones/articulos/${idSubcategoria}`
      : "/dotaciones/articulos";
    return this.request(endpoint, "GET", token);
  }

  createArticulo(token: string, data: ArticuloForm): Promise<Articulo> {
    return this.request("/dotaciones", "POST", token, data);
  }

  // Métodos para RegistrarDotacionNueva
  getAll(token: string): Promise<Articulo[]> {
    return this.request("/dotaciones", "GET", token);
  }

  getById(id: number, token: string): Promise<Articulo> {
    return this.request(`/dotaciones/${id}`, "GET", token);
  }

  getTallasByArticulo(id: number, token: string): Promise<TallaData[]> {
    return this.request(`/dotaciones/${id}/tallas`, "GET", token);
  }

  updateArticulo(id: number, data: ArticuloForm, token: string): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/${id}`, "PUT", token, data);
  }

  deleteArticulo(id: number, token: string): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/${id}`, "DELETE", token);
  }
}

export default new DotacionApi();