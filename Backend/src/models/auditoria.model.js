const pool = require('../config/db');

const logAction = async (data) => {
  if (!data.id_usuario || !data.accion) throw new Error('Datos incompletos para auditoría');
  await pool.query(
    'INSERT INTO auditoria (id_usuario, accion, descripcion, tabla_afectada, id_registro_afectado, fecha) VALUES (?, ?, ?, ?, ?, NOW())',
    [data.id_usuario, data.accion, data.descripcion || '', data.tabla_afectada || null, data.id_registro_afectado || null]
  );
};

const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT a.*, u.username as usuario FROM auditoria a LEFT JOIN usuarios_login u ON a.id_usuario = u.id_usuario ORDER BY fecha DESC'
  );
  return rows;
};

module.exports = { logAction, getAll };