const db = require('../config/db');

const Dotacion = {
  // ==================== CATEGORÍA MÉTODOS ====================
  getCategorias: async () => {
    const [rows] = await db.query('SELECT * FROM categorias_dotacion');
    return rows;
  },

  createCategoria: async (nombre) => {
    const [result] = await db.query(
      'INSERT INTO categorias_dotacion (nombre) VALUES (?)',
      [nombre]
    );
    return result.insertId;
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
    const [rows] = await db.query('SELECT * FROM subcategorias_dotacion');
    return rows;
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

  getAll: async () => {
    const [articulos] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE eliminado = 0'
    );

    for (const articulo of articulos) {
      const [tallas] = await db.query(
        'SELECT * FROM tallas_articulos WHERE id_articulo = ?',
        [articulo.id_articulo]
      );
      articulo.tallas = tallas;
    }

    return articulos;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_articulo = ? AND eliminado = 0',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const articulo = rows[0];
    const [tallas] = await db.query(
      'SELECT * FROM tallas_articulos WHERE id_articulo = ?',
      [id]
    );
    articulo.tallas = tallas;
    
    return articulo;
  },

  getTallasByArticulo: async (idArticulo) => {
    const [rows] = await db.query(
      'SELECT * FROM tallas_articulos WHERE id_articulo = ?',
      [idArticulo]
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query('INSERT INTO articulos_dotacion SET ?', [{
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: null,
      eliminado: 0
    }]);
    return result.insertId;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      'UPDATE articulos_dotacion SET ? WHERE id_articulo = ?',
      [{
        ...data,
        fecha_actualizacion: new Date()
      }, id]
    );
    return result.affectedRows > 0;
  },

  remove: async (id) => {
    const [result] = await db.query(
      'UPDATE articulos_dotacion SET eliminado = 1 WHERE id_articulo = ?',
      [id]
    );
    return result.affectedRows > 0;
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
  }
};

module.exports = Dotacion;