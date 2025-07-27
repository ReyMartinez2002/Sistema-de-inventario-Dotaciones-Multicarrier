import type {
  DotacionData,
  DotacionApiResponse,
  EstadoPayload,
  HistorialEstado,
  Categoria,
  Subcategoria,
} from "../types/Dotacion";

export class DotacionApi {
  private baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
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

  // 🔹 Obtener todas las dotaciones
  getAll(token: string): Promise<DotacionApiResponse[]> {
    return this.request("/dotaciones", "GET", token);
  }

  // 🔹 Obtener categorías
  getCategorias(token: string): Promise<Categoria[]> {
    return this.request("/dotaciones/categorias", "GET", token);
  }

  // 🔹 Obtener subcategorías
  getSubcategorias(token: string): Promise<Subcategoria[]> {
    return this.request("/dotaciones/subcategorias", "GET", token);
  }

  // 🔹 Crear nueva dotación
  create(data: DotacionData, token: string): Promise<DotacionApiResponse> {
    return this.request("/dotaciones", "POST", token, data);
  }

  // 🔹 Actualizar dotación existente
  update(
    id_dotacion: number,
    data: DotacionData,
    token: string
  ): Promise<{ ok: boolean }> {
    return this.request(`/dotaciones/${id_dotacion}`, "PUT", token, data);
  }

  // 🔹 Eliminar dotación
  // dotacionApi.ts
  delete(id_dotacion: number, token: string): Promise<{ ok: boolean }> {
    return this.request(
      `/dotaciones/${id_dotacion}`,
      "DELETE",
      token
      // No enviar body en DELETE
    );
  }
  // 🔹 Cambiar estado de dotación
  changeStatus(
    id_dotacion: number,
    estado: EstadoPayload["estado"],
    token: string
  ): Promise<{ ok: boolean }> {
    const payload: EstadoPayload = { estado };
    return this.request(
      `/dotaciones/${id_dotacion}/estado`,
      "PATCH",
      token,
      payload
    );
  }

  // 🔹 Obtener historial de estados
  getStatusHistory(
    id_dotacion: number,
    token: string
  ): Promise<HistorialEstado[]> {
    return this.request(`/dotaciones/${id_dotacion}/historial`, "GET", token);
  }
}
