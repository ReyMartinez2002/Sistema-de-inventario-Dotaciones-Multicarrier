const pool = require('../config/db');

const findByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios_login WHERE username = ?', [username]
  );
  return rows[0];
};

const getByRole = async (id_rol) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios_login WHERE id_rol = ? AND estado = "activo"', [id_rol]
  );
  return rows;
};

const create = async (data) => {
  const estado = data.estado || 'activo';

  const [result] = await pool.query(
    `INSERT INTO usuarios_login 
      (username, password_hash, nombre, rol, id_rol, estado, fecha_creacion)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [data.username, data.password_hash, data.nombre, data.rol, data.id_rol, estado]
  );

  const newUser = await findById(result.insertId);
  console.log('Usuario creado:', newUser);  // <-- agrega este log para verificar qué retorna

  return newUser;
};


const findById = async (id_usuario) => {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios_login WHERE id_usuario = ?', [id_usuario]
  );
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

const checkSuperadminExists = async () => {
  const [rows] = await pool.query(
    "SELECT id_usuario FROM usuarios_login WHERE rol = 'superadmin' LIMIT 1"
  );
  return rows.length > 0;
};

module.exports = {
  findByUsername,
  findById,
  insertLoginHistory,
  getAll,
  create,
  checkSuperadminExists,
  getByRole,
};
