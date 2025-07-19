const pool = require('../config/db');

const findByUsername = async (username) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios_login WHERE username = ?', 
      [username]
    );
    return rows[0];
  } catch (error) {
    console.error('Error en findByUsername:', error);
    throw error;
  }
};

const create = async (data) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO usuarios_login (username, password_hash, nombre, rol, id_rol, estado, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, 'activo', NOW())`,
      [data.username, data.password_hash, data.nombre, data.rol, data.id_rol]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error en create:', error);
    throw error;
  }
};

const findById = async (id_usuario) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios_login WHERE id_usuario = ?', [id_usuario]);
    return rows[0];
  } catch (error) {
    console.error('Error en findById:', error);
    throw error;
  }
};

const insertLoginHistory = async ({ id_usuario, exito, ip_acceso }) => {
  try {
    await pool.query(
      'INSERT INTO usuarios_login_historial (id_usuario, fecha_acceso, exito, ip_acceso) VALUES (?, NOW(), ?, ?)',
      [id_usuario, exito, ip_acceso]
    );
  } catch (error) {
    console.error('Error en insertLoginHistory:', error);
    throw error;
  }
};

const getAll = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios_login');
    return rows;
  } catch (error) {
    console.error('Error en getAll:', error);
    throw error;
  }
};

const checkSuperadminExists = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios_login WHERE rol = 'superadmin' LIMIT 1"
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error en checkSuperadminExists:', error);
    throw error;
  }
};

// Al final de user.model.js
module.exports = {
  findByUsername,
  findById,
  insertLoginHistory,
  getAll,
  create,
  checkSuperadminExists // Asegúrate que esté incluido
};