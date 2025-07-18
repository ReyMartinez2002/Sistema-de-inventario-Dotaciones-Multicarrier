const Dotacion = require('../models/dotacion.model');
const Auditoria = require('../models/auditoria.model');

const getAll = async (req, res) => {
  try {
    const dotaciones = await Dotacion.getAll();
    res.json(dotaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dotaciones.' });
  }
};

const getById = async (req, res) => {
  try {
    const dotacion = await Dotacion.getById(req.params.id);
    res.json(dotacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener dotación.' });
  }
};

const create = async (req, res) => {
  try {
    const id = await Dotacion.create(req.body);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'CREAR',
      descripcion: `Creación de dotación`,
      tabla_afectada: 'dotaciones',
      id_registro_afectado: id
    });
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear dotación.' });
  }
};

const update = async (req, res) => {
  try {
    await Dotacion.update(req.params.id, req.body);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'ACTUALIZAR',
      descripcion: `Actualización de dotación`,
      tabla_afectada: 'dotaciones',
      id_registro_afectado: req.params.id
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar dotación.' });
  }
};

const remove = async (req, res) => {
  try {
    await Dotacion.remove(req.params.id);
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'ELIMINAR',
      descripcion: `Eliminación de dotación con id ${req.params.id}`,
      tabla_afectada: 'dotaciones',
      id_registro_afectado: req.params.id
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar dotación.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};