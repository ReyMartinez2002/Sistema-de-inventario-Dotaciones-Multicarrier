const db = require('../config/db');

const Dotacion = {
  // Obtener todas las categorías
  getCategorias: async () => {
    const [rows] = await db.query('SELECT * FROM categorias_dotacion');
    return rows;
  },

  // Obtener todas las subcategorías
  getSubcategorias: async () => {
    const [rows] = await db.query('SELECT * FROM subcategorias_dotacion');
    return rows;
  },

  // Obtener subcategorías por categoría
  getSubcategoriasByCategoria: async (idCategoria) => {
    const [rows] = await db.query(
      'SELECT * FROM subcategorias_dotacion WHERE id_categoria = ?',
      [idCategoria]
    );
    return rows;
  },

  // Obtener todos los artículos
  getArticulos: async () => {
    const [rows] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE eliminado = 0'
    );
    return rows;
  },

  // Obtener artículos por subcategoría
  getArticulosBySubcategoria: async (idSubcategoria) => {
    const [rows] = await db.query(
      'SELECT * FROM articulos_dotacion WHERE id_subcategoria = ? AND eliminado = 0',
      [idSubcategoria]
    );
    return rows;
  },

  // Obtener todos los artículos con sus tallas
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

  // Obtener un artículo por ID
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

  // Obtener tallas por artículo
  getTallasByArticulo: async (idArticulo) => {
    const [rows] = await db.query(
      'SELECT * FROM tallas_articulos WHERE id_articulo = ?',
      [idArticulo]
    );
    return rows;
  },

  // Crear un nuevo artículo
  create: async (data) => {
    const [result] = await db.query('INSERT INTO articulos_dotacion SET ?', [{
      ...data,
      fecha_creacion: new Date(),
      fecha_actualizacion: null,
      eliminado: 0
    }]);
    return result.insertId;
  },

  // Actualizar un artículo
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

  // Eliminar (marcar como eliminado) un artículo
  remove: async (id) => {
    const [result] = await db.query(
      'UPDATE articulos_dotacion SET eliminado = 1 WHERE id_articulo = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // Agregar talla a artículo
  addTalla: async (idArticulo, data) => {
    const [result] = await db.query('INSERT INTO tallas_articulos SET ?', [{
      ...data,
      id_articulo: idArticulo
    }]);
    return result.insertId;
  },

  // Actualizar talla de artículo
  updateTalla: async (idTalla, data) => {
    const [result] = await db.query(
      'UPDATE tallas_articulos SET ? WHERE id_talla = ?',
      [data, idTalla]
    );
    return result.affectedRows > 0;
  },

  // Eliminar talla de artículo
  removeTalla: async (idTalla) => {
    const [result] = await db.query(
      'DELETE FROM tallas_articulos WHERE id_talla = ?',
      [idTalla]
    );
    return result.affectedRows > 0;
  },

  // Eliminar todas las tallas de un artículo
  removeAllTallas: async (idArticulo) => {
    const [result] = await db.query(
      'DELETE FROM tallas_articulos WHERE id_articulo = ?',
      [idArticulo]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Dotacion;