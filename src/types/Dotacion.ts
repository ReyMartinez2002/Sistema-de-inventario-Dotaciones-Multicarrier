export type Genero = 'Masculino' | 'Femenino' | 'Unisex';

export interface TallaData {
  id_talla?: number;
  talla: string;
  stock_nuevo: number;
  stock_reutilizable?: number;
}

export interface Articulo {
  id_articulo: number;
  id_subcategoria: number;
  nombre: string;
  descripcion: string | null;
  genero: Genero;
  eliminado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  tallas?: TallaData[];
  subcategoria?: string;
  categoria?: string;
}

export interface ArticuloForm {
  nombre: string;
  descripcion?: string;
  genero: Genero;
  id_subcategoria: number;
  tallas?: TallaData[];
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Subcategoria {
  id_subcategoria: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export interface TallaBD {
  id_talla: number;
  id_articulo: number;
  talla: string;
  fecha_creacion: string;
}

export interface StockTalla {
  id_stock?: number;
  id_talla: number;
  stock_nuevo: number;
  stock_reutilizable?: number;
}

// Nuevas interfaces agregadas
export interface StockData {
  id_talla: number;
  talla: string;
  stock_nuevo: number;
  stock_reutilizable: number;
}

export interface MovimientoStock {
  id_movimiento: number;
  id_talla: number;
  talla: string;
  id_articulo: number;
  articulo: string;
  cantidad: number;
  tipo: 'ingreso' | 'salida';
  motivo: string;
  id_empleado?: number;
  empleado?: string;
  fecha_movimiento: string;
}

// Opcional: Tipo para filtros de movimientos de stock
export interface FiltrosMovimientosStock {
  id_articulo?: number;
  id_talla?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: 'ingreso' | 'salida';
  limit?: number;
  offset?: number;
}