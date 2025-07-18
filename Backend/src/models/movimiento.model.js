const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT m.*, d.descripcion as dotacion, e.nombre as empleado, u.username as usuario_admin
     FROM movimientos_dotacion m
     JOIN dotaciones d ON m.id_dotacion = d.id_dotacion
     JOIN empleados e ON m.id_empleado = e.id_empleado
     JOIN usuarios_login u ON m.id_usuario = u.id_usuario`
  );
  return rows;
};

const getById = async (id_movimiento) => {
  const [rows] = await pool.query(
    `SELECT m.*, d.descripcion as dotacion, e.nombre as empleado, u.username as usuario_admin
     FROM movimientos_dotacion m
     JOIN dotaciones d ON m.id_dotacion = d.id_dotacion
     JOIN empleados e ON m.id_empleado = e.id_empleado
     JOIN usuarios_login u ON m.id_usuario = u.id_usuario
     WHERE m.id_movimiento = ?`,
    [id_movimiento]
  );
  return rows[0];
};

const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO movimientos_dotacion (id_dotacion, id_empleado, id_usuario, tipo_movimiento, cantidad, estado_post_movimiento, observaciones, archivo_adjunto, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [data.id_dotacion, data.id_empleado, data.id_usuario, data.tipo_movimiento, data.cantidad, data.estado_post_movimiento, data.observaciones, data.archivo_adjunto]
  );
  return result.insertId;
};

module.exports = {
  getAll,
  getById,
  create,
};