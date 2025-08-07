import type {
  Articulo,
  ArticuloForm,
  TallaData,
  Categoria,
  Subcategoria,
  StockData,
} from "../types/Dotacion";

export class DotacionApi {
  private baseUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    token: string,
    body?: object
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`[DotacionApi] Request:`, { method, url, body });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const contentType = response.headers.get("content-type");
      let responseData: unknown;
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log(`[DotacionApi] Response:`, { url, status: response.status, responseData });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        // Solo si es un objeto, intenta extraer 'message' o 'error'
        if (typeof responseData === "object" && responseData !== null) {
          const obj = responseData as Record<string, unknown>;
          if (typeof obj.message === "string") errorMessage = obj.message;
          else if (typeof obj.error === "string") errorMessage = obj.error;
        }
        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
      console.error(`[DotacionApi] API Error - ${method} ${endpoint}:`, error);
      throw new Error(
        error instanceof Error ? error.message : "Unknown API error"
      );
    }
  }



  // ==================== MÉTODOS PARA ARTÍCULOS ====================

  /**
   * @deprecated Usar createArticulo en su lugar
   */
  create(token: string, data: ArticuloForm): Promise<{ id: number }> {
    return this.createArticulo(token, data);
  }

  createArticulo(token: string, data: ArticuloForm): Promise<{ id: number }> {
    if (!data.nombre || !data.id_subcategoria) {
      return Promise.reject(
        new Error("Nombre e ID de subcategoría son requeridos")
      );
    }

    const payload = {
      ...data,
      descripcion: data.descripcion || null,
      genero: data.genero || "Unisex",
    };

    return this.request("/dotaciones/articulos", "POST", token, payload);
  }

  // ==================== CATEGORÍA MÉTODOS ====================
  async getCategorias(token: string): Promise<Categoria[]> {
    const resp = await this.request<{ success: boolean; data: Categoria[] }>(
      "/dotaciones/categorias",
      "GET",
      token
    );
    return resp.data;
  }

  createCategoria(token: string, data: { nombre: string }): Promise<{ id: number }> {
    return this.request("/dotaciones/categorias", "POST", token, data);
  }

  deleteCategoria(token: string, id: number): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/categorias/${id}`, "DELETE", token);
  }

  // ==================== SUBCATEGORÍA MÉTODOS ====================
  async getSubcategorias(token: string, idCategoria?: number): Promise<Subcategoria[]> {
    const endpoint = idCategoria
      ? `/dotaciones/subcategorias/${idCategoria}`
      : "/dotaciones/subcategorias";
    const resp = await this.request<{ success: boolean; data: Subcategoria[] }>(
      endpoint,
      "GET",
      token
    );
    return resp.data;
  }

  createSubcategoria(
    token: string,
    data: { nombre: string; descripcion?: string; id_categoria: number }
  ): Promise<{ id: number }> {
    return this.request("/dotaciones/subcategorias", "POST", token, data);
  }

  deleteSubcategoria(token: string, id: number): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/subcategorias/${id}`, "DELETE", token);
  }

  // ==================== ARTÍCULO MÉTODOS ====================
  async getArticulos(token: string, idSubcategoria?: number): Promise<Articulo[]> {
    const endpoint = idSubcategoria
      ? `/dotaciones/articulos/${idSubcategoria}`
      : "/dotaciones/articulos";
    const resp = await this.request<{ success: boolean; data: Articulo[] }>(
      endpoint,
      "GET",
      token
    );
    return resp.data;
  }

async getAll(token: string): Promise<Articulo[]> {
  const resp = await this.request<{ success: boolean; data: Articulo[] }>(
    "/dotaciones/articulos/all",
    "GET",
    token
  );
  return resp.data;
}

  async getById(id: number, token: string): Promise<Articulo> {
    const resp = await this.request<{ success: boolean; data: Articulo }>(
      `/dotaciones/articulos/${id}`,
      "GET",
      token
    );
    return resp.data;
  }

  async getTallasByArticulo(id: number, token: string): Promise<TallaData[]> {
    const resp = await this.request<{ success: boolean; data: TallaData[] }>(
      `/dotaciones/articulos/${id}/tallas`,
      "GET",
      token
    );
    return resp.data;
  }

  updateArticulo(
    id: number,
    data: ArticuloForm,
    token: string
  ): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/articulos/${id}`, "PUT", token, data);
  }

  deleteArticulo(id: number, token: string): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/articulos/${id}`, "DELETE", token);
  }

  // ==================== MÉTODOS PARA STOCK ====================
  async getStockByArticulo(
    token: string,
    idArticulo: number
  ): Promise<StockData[]> {
    const resp = await this.request<{ success: boolean; data: StockData[] }>(
      `/dotaciones/stock/articulo/${idArticulo}`,
      "GET",
      token
    );
    return resp.data;
  }

  ingresarStock(
    token: string,
    data: {
      id_talla: number;
      cantidad: number;
      estado: "nuevo" | "reutilizable";
      motivo?: string;
    }
  ): Promise<{ success: boolean }> {
    return this.request("/dotaciones/stock/ingresar", "POST", token, data);
  }

  retirarStock(
    token: string,
    data: {
      id_talla: number;
      cantidad: number;
      motivo: string;
      id_empleado?: number;
    }
  ): Promise<{ success: boolean }> {
    return this.request("/dotaciones/stock/retirar", "POST", token, data);
  }
}

export default new DotacionApi();