const pool = require('../config/db');

const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM usuarios_login WHERE username = ?', [username]);
  return rows[0];
};

// Crear usuario
const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO usuarios_login (username, password_hash, nombre, rol, id_rol, estado, fecha_creacion)
     VALUES (?, ?, ?, ?, ?, 'activo', NOW())`,
    [data.username, data.password_hash, data.nombre, data.rol, data.id_rol]
  );
  return result.insertId;
};

const findById = async (id_usuario) => {
  const [rows] = await pool.query('SELECT * FROM usuarios_login WHERE id_usuario = ?', [id_usuario]);
  return rows[0];
};

const insertLoginHistory = async ({ id_usuario, exito, ip_acceso }) => {
  await pool.query(
    'INSERT INTO usuarios_login_historial (id_usuario, fecha_acceso, exito, ip_acceso) VALUES (?, NOW(), ?, ?)',
    [id_usuario, exito, ip_acceso]
  );
};

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM usuarios_login');
  return rows;
};

module.exports = {
  findByUsername,
  findById,
  insertLoginHistory,
  getAll,
  create,
};