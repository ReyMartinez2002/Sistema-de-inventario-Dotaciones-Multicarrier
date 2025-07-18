const Empleado = require('../models/empleado.model');
const Auditoria = require('../models/auditoria.model');

const getAll = async (req, res) => {
  try {
    const empleados = await Empleado.getAll();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados.' });
  }
};

const getById = async (req, res) => {
  try {
    const empleado = await Empleado.getById(req.params.id);
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleado.' });
  }
};

const create = async (req, res) => {
  try {
    const id = await Empleado.create(req.body);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'CREAR',
      descripcion: `Creación de empleado ${req.body.nombre}`,
      tabla_afectada: 'empleados',
      id_registro_afectado: id
    });
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear empleado.' });
  }
};

const update = async (req, res) => {
  try {
    await Empleado.update(req.params.id, req.body);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'ACTUALIZAR',
      descripcion: `Actualización de empleado ${req.body.nombre}`,
      tabla_afectada: 'empleados',
      id_registro_afectado: req.params.id
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleado.' });
  }
};

const remove = async (req, res) => {
  try {
    await Empleado.remove(req.params.id);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'RETIRAR',
      descripcion: `Retiro de empleado con id ${req.params.id}`,
      tabla_afectada: 'empleados',
      id_registro_afectado: req.params.id
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al retirar empleado.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};