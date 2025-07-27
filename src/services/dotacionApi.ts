// src/services/dotacionApi.ts
import type { DotacionData, EstadoPayload, HistorialEstado } from '../types/Dotacion';

export class DotacionApi {
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    token: string,
    body?: object
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
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

  getAll(token: string) {
    return this.request<DotacionData[]>('/dotaciones', 'GET', token);
  }

  getCategorias(token: string) {
    return this.request<string[]>('/dotaciones/categorias', 'GET', token);
  }

  getSubcategorias(token: string) {
    return this.request<string[]>('/dotaciones/subcategorias', 'GET', token);
  }

  create(data: DotacionData, token: string) {
    return this.request<{ id: number }>('/dotaciones', 'POST', token, data);
  }

  update(id: number, data: DotacionData, token: string) {
    return this.request<{ ok: boolean }>(`/dotaciones/${id}`, 'PUT', token, data);
  }

  delete(id: number, token: string) {
    return this.request<{ ok: boolean }>(`/dotaciones/${id}`, 'DELETE', token);
  }

  changeStatus(id: number, estado: string, token: string) {
    const payload: EstadoPayload = { estado };
    return this.request<{ ok: boolean }>(`/dotaciones/${id}/estado`, 'PATCH', token, payload);
  }

  getStatusHistory(id: number, token: string) {
    return this.request<HistorialEstado[]>(`/dotaciones/${id}/historial`, 'GET', token);
  }
}
