export interface DotacionData {
  id_dotacion?: number; // 👈 clave primaria opcional, necesaria para edición
  id_subcategoria: number;
  descripcion?: string;
  genero?: string;
  estado?: 'nuevo' | 'reutilizable' | 'dañado' | 'devuelto'; // opcional si lo usas
  stock_nuevo?: number;
  stock_reutilizable?: number;
  stock_minimo?: number;
  precio_unitario?: number;
}
export interface DotacionApiResponse {
  id_dotacion: number; // 👈 debe coincidir con la BD
  id_subcategoria: number;
  descripcion: string;
  genero?: string;
  stock_nuevo: number;
  stock_reutilizable?: number;
  stock_minimo?: number;
  precio_unitario?: number;
  fecha_creacion?: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
}

export interface EstadoPayload {
  estado: 'nuevo' | 'reutilizable' | 'dañado' | 'devuelto';
  id_dotacion?: number; // si el endpoint lo requiere
}
export interface HistorialEstado {
  id_dotacion: number;
  fecha: string; // considera usar Date si prefieres tipos más estrictos
  estado: 'nuevo' | 'reutilizable' | 'dañado' | 'devuelto';
  usuario: string; // o mejor aún: { id: number, nombre: string }
}
