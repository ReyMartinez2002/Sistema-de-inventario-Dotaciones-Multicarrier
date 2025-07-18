const pool = require('../config/db');

const logAction = async (data) => {
  await pool.query(
    'INSERT INTO auditoria (id_usuario, accion, descripcion, fecha, tabla_afectada, id_registro_afectado) VALUES (?, ?, ?, NOW(), ?, ?)',
    [data.id_usuario, data.accion, data.descripcion, data.tabla_afectada, data.id_registro_afectado]
  );
};

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM auditoria ORDER BY fecha DESC');
  return rows;
};

module.exports = { logAction, getAll };