export interface DotacionData {
  id_subcategoria: number;
  descripcion?: string;
  genero?: string;
  stock_nuevo?: number;
  stock_reutilizable?: number;
  stock_minimo?: number;
  precio_unitario?: number;
}

export interface EstadoPayload {
  estado: string;
}

export interface HistorialEstado {
  fecha: string;
  estado: string;
  usuario: string;
}
