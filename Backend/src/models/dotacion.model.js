const db = require('../config/db');
const { dotacionSchema } = require('../validators/dotacion.validator');

const Dotacion = {
  /**
   * Obtiene todas las dotaciones no eliminadas
   */
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM dotaciones WHERE eliminado = 0');
    return rows;
  },

  /**
   * Obtiene una dotación por ID (solo si no está eliminada)
   */
  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM dotaciones WHERE id_dotacion = ? AND eliminado = 0', 
      [id]
    );
    return rows[0];
  },

  /**
   * Crea una nueva dotación con validación
   */
  create: async (data) => {
    // Validar y normalizar datos
    const { error, value } = dotacionSchema.validate(data, {
      stripUnknown: true,
      abortEarly: false
    });

    if (error) {
      throw new Error(`Validación fallida: ${error.details.map(d => d.message).join(', ')}`);
    }

    // Convertir precio_unitario a número si es necesario
    if (value.precio_unitario !== undefined && typeof value.precio_unitario === 'string') {
      value.precio_unitario = parseFloat(value.precio_unitario);
    }

    // Establecer valores por defecto
    const completeData = {
      ...value,
      stock_nuevo: value.stock_nuevo || 0,
      stock_reutilizable: value.stock_reutilizable || 0,
      stock_minimo: value.stock_minimo || 0,
      precio_unitario: value.precio_unitario || 0.00,
      estado: value.estado || 'nuevo',
      eliminado: 0 // Asegurar que no se cree como eliminado
    };

    const [result] = await db.query('INSERT INTO dotaciones SET ?', [completeData]);
    return result.insertId;
  },

  /**
   * Actualiza una dotación existente con validación
   */
  update: async (id, data) => {
    // Validar y normalizar datos
    const { error, value } = dotacionSchema.validate(data, {
      stripUnknown: true,
      abortEarly: false
    });

    if (error) {
      throw new Error(`Validación fallida: ${error.details.map(d => d.message).join(', ')}`);
    }

    // Convertir precio_unitario a número si es necesario
    if (value.precio_unitario !== undefined && typeof value.precio_unitario === 'string') {
      value.precio_unitario = parseFloat(value.precio_unitario);
    }

    // Excluir el campo eliminado de las actualizaciones normales
    const { eliminado, ...updateData } = value;
    
    const [result] = await db.query(
      'UPDATE dotaciones SET ? WHERE id_dotacion = ? AND eliminado = 0', 
      [updateData, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Dotación no encontrada o ya eliminada');
    }

    return await Dotacion.getById(id);
  },

  /**
   * Elimina una dotación (marcado lógico)
   */
  remove: async (id) => {
    // Verificar primero que existe y no está eliminada
    const dotacion = await Dotacion.getById(id);
    if (!dotacion) {
      throw new Error('Dotación no encontrada o ya eliminada');
    }

    // Actualización para marcado lógico
    const [result] = await db.query(
      'UPDATE dotaciones SET eliminado = 1 WHERE id_dotacion = ?', 
      [id]
    );
    
    return result.affectedRows > 0;
  },

  /**
   * Eliminación física (solo para administración avanzada)
   */
  hardDelete: async (id) => {
    const [result] = await db.query(
      'DELETE FROM dotaciones WHERE id_dotacion = ?', 
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Obtiene todas las categorías
   */
  getCategorias: async () => {
    const [rows] = await db.query('SELECT id_categoria, nombre FROM categorias_dotacion');
    return rows;
  },

  /**
   * Obtiene todas las subcategorías
   */
  getSubcategorias: async () => {
    const [rows] = await db.query(`
      SELECT 
        s.id_subcategoria,
        s.id_categoria,
        s.nombre AS nombre
      FROM 
        subcategorias_dotacion s
    `);
    return rows;
  },

  /**
   * Valida los datos de dotación sin guardar
   */
  validate: async (data) => {
    const { error, value } = dotacionSchema.validate(data, {
      stripUnknown: true,
      abortEarly: false
    });

    if (error) {
      return { isValid: false, errors: error.details };
    }

    return { isValid: true, data: value };
  }
};

module.exports = Dotacion;