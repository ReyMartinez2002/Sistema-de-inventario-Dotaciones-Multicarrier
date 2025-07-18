const Auditoria = require('../models/auditoria.model');

const getAll = async (req, res) => {
  try {
    const logs = await Auditoria.getAll();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener auditoría.' });
  }
};

module.exports = { getAll };