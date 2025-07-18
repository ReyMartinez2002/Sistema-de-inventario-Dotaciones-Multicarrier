const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT d.*, s.nombre as subcategoria, c.nombre as categoria FROM dotaciones d JOIN subcategorias_dotacion s ON d.id_subcategoria=s.id_subcategoria JOIN categorias_dotacion c ON s.id_categoria=c.id_categoria WHERE d.eliminado=FALSE'
  );
  return rows;
};

const getById = async (id_dotacion) => {
  const [rows] = await pool.query('SELECT * FROM dotaciones WHERE id_dotacion = ?', [id_dotacion]);
  return rows[0];
};

const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO dotaciones (id_subcategoria, descripcion, genero, estado, stock_nuevo, stock_reutilizable, stock_minimo, precio_unitario, fecha_creacion, eliminado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), FALSE)',
    [data.id_subcategoria, data.descripcion, data.genero, data.estado, data.stock_nuevo, data.stock_reutilizable, data.stock_minimo, data.precio_unitario]
  );
  return result.insertId;
};

const update = async (id_dotacion, data) => {
  await pool.query(
    'UPDATE dotaciones SET id_subcategoria=?, descripcion=?, genero=?, estado=?, stock_nuevo=?, stock_reutilizable=?, stock_minimo=?, precio_unitario=?, fecha_actualizacion=NOW() WHERE id_dotacion=?',
    [data.id_subcategoria, data.descripcion, data.genero, data.estado, data.stock_nuevo, data.stock_reutilizable, data.stock_minimo, data.precio_unitario, id_dotacion]
  );
};

const remove = async (id_dotacion) => {
  await pool.query('UPDATE dotaciones SET eliminado=TRUE WHERE id_dotacion=?', [id_dotacion]);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};