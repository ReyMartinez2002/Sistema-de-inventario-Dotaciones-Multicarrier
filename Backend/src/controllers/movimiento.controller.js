const Movimiento = require('../models/movimiento.model');
const Auditoria = require('../models/auditoria.model');

const getAll = async (req, res) => {
  try {
    const movimientos = await Movimiento.getAll();
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos.' });
  }
};

const getById = async (req, res) => {
  try {
    const movimiento = await Movimiento.getById(req.params.id);
    res.json(movimiento);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimiento.' });
  }
};

const create = async (req, res) => {
  try {
    const id = await Movimiento.create({ ...req.body, id_usuario: req.usuario.id_usuario });
    await Auditoria.logAction({
      id_usuario: req.usuario.id_usuario,
      accion: 'MOVIMIENTO',
      descripcion: `Nuevo movimiento de dotación`,
      tabla_afectada: 'movimientos_dotacion',
      id_registro_afectado: id
    });
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar movimiento.' });
  }
};

module.exports = {
  getAll,
  getById,
  create
};