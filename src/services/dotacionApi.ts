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
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 
                         errorData.error || 
                         `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error - ${method} ${endpoint}:`, error);
      throw new Error(
        error instanceof Error ? error.message : 'Unknown API error'
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
      return Promise.reject(new Error('Nombre e ID de subcategoría son requeridos'));
    }
    
    const payload = {
      ...data,
      descripcion: data.descripcion || null,
      genero: data.genero || 'Unisex'
    };
    
    return this.request("/dotaciones/articulos", "POST", token, payload);
  }

  // ==================== CATEGORÍA MÉTODOS ====================
  getCategorias(token: string): Promise<Categoria[]> {
    return this.request("/dotaciones/categorias", "GET", token);
  }

  createCategoria(token: string, data: { nombre: string }): Promise<{ id: number }> {
    return this.request("/dotaciones/categorias", "POST", token, data);
  }

  deleteCategoria(token: string, id: number): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/categorias/${id}`, "DELETE", token);
  }

  // ==================== SUBCATEGORÍA MÉTODOS ====================
  getSubcategorias(token: string, idCategoria?: number): Promise<Subcategoria[]> {
    const endpoint = idCategoria 
      ? `/dotaciones/subcategorias/${idCategoria}`
      : "/dotaciones/subcategorias";
    return this.request(endpoint, "GET", token);
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
  getArticulos(token: string, idSubcategoria?: number): Promise<Articulo[]> {
    const endpoint = idSubcategoria
      ? `/dotaciones/articulos/${idSubcategoria}`
      : "/dotaciones/articulos";
    return this.request(endpoint, "GET", token);
  }

  getAll(token: string): Promise<Articulo[]> {
    return this.request("/dotaciones/articulos", "GET", token);
  }

  getById(id: number, token: string): Promise<Articulo> {
    return this.request(`/dotaciones/articulos/${id}`, "GET", token);
  }

  getTallasByArticulo(id: number, token: string): Promise<TallaData[]> {
    return this.request(`/dotaciones/articulos/${id}/tallas`, "GET", token);
  }

  updateArticulo(id: number, data: ArticuloForm, token: string): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/articulos/${id}`, "PUT", token, data);
  }

  deleteArticulo(id: number, token: string): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/articulos/${id}`, "DELETE", token);
  }

  // ==================== MÉTODOS PARA STOCK ====================
  getStockByArticulo(token: string, idArticulo: number): Promise<StockData[]> {
    return this.request(`/dotaciones/stock/articulo/${idArticulo}`, "GET", token);
  }

  ingresarStock(
    token: string,
    data: {
      id_talla: number;
      cantidad: number;
      estado: 'nuevo' | 'reutilizable';
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