const pool = require('../config/db');

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM empleados WHERE estado="activo" ORDER BY nombre ASC`
  );
  return rows;
};

const getById = async (id_empleado) => {
  const [rows] = await pool.query('SELECT * FROM empleados WHERE id_empleado = ?', [id_empleado]);
  return rows[0];
};

const create = async (data) => {
  const [result] = await pool.query(
    'INSERT INTO empleados (nombre, documento, telefono, correo, cargo, edad, fecha_ingreso, estado, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.nombre, data.documento, data.telefono, data.correo, data.cargo, data.edad, data.fecha_ingreso, data.estado, data.foto]
  );
  return result.insertId;
};

const update = async (id_empleado, data) => {
  await pool.query(
    'UPDATE empleados SET nombre=?, documento=?, telefono=?, correo=?, cargo=?, edad=?, fecha_ingreso=?, estado=?, foto=? WHERE id_empleado=?',
    [data.nombre, data.documento, data.telefono, data.correo, data.cargo, data.edad, data.fecha_ingreso, data.estado, data.foto, id_empleado]
  );
};

const remove = async (id_empleado) => {
  await pool.query('UPDATE empleados SET estado="retirado" WHERE id_empleado=?', [id_empleado]);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};