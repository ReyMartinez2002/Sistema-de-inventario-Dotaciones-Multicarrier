const db = require('../config/db');

const Dotacion = {
  // ==================== CATEGORÍA MÉTODOS ====================
  getCategorias: async () => {
    const [rows] = await db.query('SELECT * FROM categorias_dotacion');
    return rows;
  },

  getCategoriaById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM categorias_dotacion WHERE id_categoria = ?',
      [id]
    );
    return rows[0] || null;
  },

  createCategoria: async (nombre) => {
    const [result] = await db.query(
      'INSERT INTO categorias_dotacion (nombre) VALUES (?)',
      [nombre]
    );
    return result.insertId;
  },

  updateCategoria: async (id, nombre) => {
    const [result] = await db.query(
      'UPDATE categorias_dotacion SET nombre = ? WHERE id_categoria = ?',
      [nombre, id]
    );
    return result.affectedRows > 0;
  },

  deleteCategoria: async (id) => {
    const [result] = await db.query(
      'DELETE FROM categorias_dotacion WHERE id_categoria = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ==================== SUBCATEGORÍA MÉTODOS ====================
  getSubcategorias: async () => {
    const [rows] = await db.query(`
      SELECT sd.*, cd.nombre as categoria 
      FROM subcategorias_dotacion sd
      JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
    `);
    return rows;
  },

  getSubcategoriaById: async (id) => {
    const [rows] = await db.query(`
      SELECT sd.*, cd.nombre as categoria 
      FROM subcategorias_dotacion sd
      JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
      WHERE sd.id_subcategoria = ?
    `, [id]);
    return rows[0] || null;
  },

  getSubcategoriasByCategoria: async (idCategoria) => {
    const [rows] = await db.query(
      'SELECT * FROM subcategorias_dotacion WHERE id_categoria = ?',
      [idCategoria]
    );
    return rows;
  },

  createSubcategoria: async (data) => {
    const [result] = await db.query(
      'INSERT INTO subcategorias_dotacion (nombre, id_categoria, descripcion) VALUES (?, ?, ?)',
      [data.nombre, data.id_categoria, data.descripcion || null]
    );
    return result.insertId;
  },

  updateSubcategoria: async (id, data) => {
    const [result] = await db.query(
      'UPDATE subcategorias_dotacion SET nombre = ?, id_categoria = ?, descripcion = ? WHERE id_subcategoria = ?',
      [data.nombre, data.id_categoria, data.descripcion || null, id]
    );
    return result.affectedRows > 0;
  },

  deleteSubcategoria: async (id) => {
    const [result] = await db.query(
      'DELETE FROM subcategorias_dotacion WHERE id_subcategoria = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ==================== ARTÍCULO MÉTODOS ====================
  getArticulos: async () => {
    const [rows] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE eliminado = 0'
    );
    return rows;
  },

  getArticulosBySubcategoria: async (idSubcategoria) => {
    const [rows] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_subcategoria = ? AND eliminado = 0',
      [idSubcategoria]
    );
    return rows;
  },

  getAllArticulos: async () => {
    const [articulos] = await db.query(`
      SELECT ad.*, sd.nombre as subcategoria, cd.nombre as categoria 
      FROM articulos_dotacion ad
      JOIN subcategorias_dotacion sd ON ad.id_subcategoria = sd.id_subcategoria
      JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
      WHERE ad.eliminado = 0
    `);

    for (const articulo of articulos) {
      const [tallas] = await db.query(
        `SELECT ta.*, 
         COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
         COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
         FROM tallas_articulos ta 
         WHERE ta.id_articulo = ?`,
        [articulo.id_articulo]
      );
      articulo.tallas = tallas;
    }

    return articulos;
  },

  getArticuloById: async (id) => {
    const [rows] = await db.query(`
      SELECT ad.*, sd.nombre as subcategoria, cd.nombre as categoria 
      FROM articulos_dotacion ad
      JOIN subcategorias_dotacion sd ON ad.id_subcategoria = sd.id_subcategoria
      JOIN categorias_dotacion cd ON sd.id_categoria = cd.id_categoria
      WHERE ad.id_articulo = ? AND ad.eliminado = 0
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const articulo = rows[0];
    const [tallas] = await db.query(
      `SELECT ta.*, 
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
       FROM tallas_articulos ta 
       WHERE ta.id_articulo = ?`,
      [id]
    );
    articulo.tallas = tallas;
    
    return articulo;
  },

  createArticulo: async (data) => {
    const [result] = await db.query('INSERT INTO articulos_dotacion SET ?', [{
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: null,
      eliminado: 0
    }]);
    return result.insertId;
  },

  updateArticulo: async (id, data) => {
    const [result] = await db.query(
      'UPDATE articulos_dotacion SET ? WHERE id_articulo = ?',
      [{
        ...data,
        fecha_actualizacion: new Date()
      }, id]
    );
    return result.affectedRows > 0;
  },

  deleteArticulo: async (id) => {
    const [result] = await db.query(
      'UPDATE articulos_dotacion SET eliminado = 1, fecha_actualizacion = NOW() WHERE id_articulo = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ==================== TALLAS MÉTODOS ====================
  getTallasByArticulo: async (idArticulo) => {
    const [rows] = await db.query(
      `SELECT ta.*, 
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'nuevo'), 0) as stock_nuevo,
       COALESCE((SELECT SUM(cantidad) FROM stock_dotacion WHERE id_talla = ta.id_talla AND estado = 'reutilizable'), 0) as stock_reutilizable
       FROM tallas_articulos ta 
       WHERE ta.id_articulo = ?`,
      [idArticulo]
    );
    return rows;
  },

  getTallaById: async (idTalla) => {
    const [rows] = await db.query(
      'SELECT * FROM tallas_articulos WHERE id_talla = ?',
      [idTalla]
    );
    return rows[0] || null;
  },

  addTalla: async (idArticulo, data) => {
    const [result] = await db.query('INSERT INTO tallas_articulos SET ?', [{
      ...data,
      id_articulo: idArticulo
    }]);
    return result.insertId;
  },

  updateTalla: async (idTalla, data) => {
    const [result] = await db.query(
      'UPDATE tallas_articulos SET ? WHERE id_talla = ?',
      [data, idTalla]
    );
    return result.affectedRows > 0;
  },

  removeTalla: async (idTalla) => {
    const [result] = await db.query(
      'DELETE FROM tallas_articulos WHERE id_talla = ?',
      [idTalla]
    );
    return result.affectedRows > 0;
  },

  removeAllTallas: async (idArticulo) => {
    const [result] = await db.query(
      'DELETE FROM tallas_articulos WHERE id_articulo = ?',
      [idArticulo]
    );
    return result.affectedRows > 0;
  },

  // ==================== STOCK MÉTODOS ====================
  getStockByTalla: async (idTalla) => {
    const [rows] = await db.query(
      'SELECT * FROM stock_dotacion WHERE id_talla = ?',
      [idTalla]
    );
    return rows;
  },

  getStockByArticulo: async (idArticulo) => {
    const [rows] = await db.query(
      `SELECT 
        ta.id_talla,
        ta.talla,
        COALESCE(SUM(CASE WHEN sd.estado = 'nuevo' THEN sd.cantidad ELSE 0 END), 0) as stock_nuevo,
        COALESCE(SUM(CASE WHEN sd.estado = 'reutilizable' THEN sd.cantidad ELSE 0 END), 0) as stock_reutilizable
      FROM tallas_articulos ta
      LEFT JOIN stock_dotacion sd ON ta.id_talla = sd.id_talla
      WHERE ta.id_articulo = ?
      GROUP BY ta.id_talla, ta.talla`,
      [idArticulo]
    );
    return rows;
  },

  ingresarStock: async (data) => {
    const [result] = await db.query('INSERT INTO stock_dotacion SET ?', [{
      ...data,
      fecha_ingreso: new Date()
    }]);
    return result.insertId;
  },

  actualizarStock: async (idStock, cantidad) => {
    const [result] = await db.query(
      'UPDATE stock_dotacion SET cantidad = ? WHERE id_stock = ?',
      [cantidad, idStock]
    );
    return result.affectedRows > 0;
  },

  retirarStock: async (idTalla, cantidad, estado) => {
    await db.query('START TRANSACTION');
    try {
      // Verificar stock disponible
      const [stock] = await db.query(
        'SELECT SUM(cantidad) as total FROM stock_dotacion WHERE id_talla = ? AND estado = ?',
        [idTalla, estado]
      );

      if (stock[0].total < cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Implementar lógica FIFO para retiro
      const [result] = await db.query(
        `UPDATE stock_dotacion 
         SET cantidad = cantidad - ? 
         WHERE id_talla = ? AND estado = ? AND cantidad >= ?
         ORDER BY fecha_ingreso ASC
         LIMIT 1`,
        [cantidad, idTalla, estado, cantidad]
      );

      // Eliminar registros con cantidad 0
      await db.query(
        'DELETE FROM stock_dotacion WHERE cantidad <= 0',
        [idTalla]
      );

      await db.query('COMMIT');
      return result.affectedRows > 0;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  },

  // ==================== MÉTODOS AUXILIARES ====================
  verificarSubcategoriasEnCategoria: async (idCategoria) => {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM subcategorias_dotacion WHERE id_categoria = ?',
      [idCategoria]
    );
    return result[0].count > 0;
  },

  verificarArticulosEnSubcategoria: async (idSubcategoria) => {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM articulos_dotacion WHERE id_subcategoria = ? AND eliminado = 0',
      [idSubcategoria]
    );
    return result[0].count > 0;
  },

  verificarTallasEnArticulo: async (idArticulo) => {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM tallas_articulos WHERE id_articulo = ?',
      [idArticulo]
    );
    return result[0].count > 0;
  }
};

module.exports = Dotacion;