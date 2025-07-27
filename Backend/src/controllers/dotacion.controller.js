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
    // Validar datos mínimos
    if (!req.body.id_subcategoria || !req.body.descripcion) {
      return res.status(400).json({ error: 'Subcategoría y descripción son requeridos' });
    }

    // Establecer valores por defecto
    const dotacionData = {
      ...req.body,
      stock_nuevo: req.body.stock_nuevo || 0,
      stock_reutilizable: req.body.stock_reutilizable || 0,
      stock_minimo: req.body.stock_minimo || 0,
      precio_unitario: req.body.precio_unitario || 0.00,
      estado: 'nuevo'
    };

    const id = await Dotacion.create(dotacionData);
    
    // Auditoría condicional
    if (req.user?.id_usuario) {
      await Auditoria.logAction({
        id_usuario: req.user.id_usuario,
        accion: 'CREAR',
        descripcion: 'Creación de dotación',
        tabla_afectada: 'dotaciones',
        id_registro_afectado: id
      });
    }
    
    res.json({ id });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({ 
      error: 'Error al crear dotación',
      details: error.message 
    });
  }
};

const update = async (req, res) => {
  try {
    // Validar datos mínimos
    if (!req.body.id_subcategoria || !req.body.descripcion) {
      return res.status(400).json({ error: 'Subcategoría y descripción son requeridos' });
    }

    await Dotacion.update(req.params.id, req.body);
    
    // Auditoría condicional
    if (req.user?.id_usuario) {
      await Auditoria.logAction({
        id_usuario: req.user.id_usuario,
        accion: 'ACTUALIZAR',
        descripcion: 'Actualización de dotación',
        tabla_afectada: 'dotaciones',
        id_registro_afectado: req.params.id
      });
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({ 
      error: 'Error al actualizar dotación',
      details: error.message 
    });
  }
};


// controllers/dotacion.controller.js
const remove = async (req, res) => {
  try {
    // Verificar que el usuario tiene permisos
    if (!req.user?.id_usuario) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Verificar que existe la dotación
    const dotacion = await Dotacion.getById(req.params.id);
    if (!dotacion) {
      return res.status(404).json({ error: 'Dotación no encontrada' });
    }

    // Eliminación lógica (recomendado)
    const success = await Dotacion.remove(req.params.id);
    
    if (!success) {
      return res.status(500).json({ error: 'No se pudo eliminar la dotación' });
    }

    // Registrar auditoría
    await Auditoria.logAction({
      id_usuario: req.user.id_usuario,
      accion: 'ELIMINAR',
      descripcion: `Eliminación de dotación ID ${req.params.id}`,
      tabla_afectada: 'dotaciones',
      id_registro_afectado: req.params.id
    });

    return res.json({ ok: true });
    
  } catch (error) {
    console.error('Error en eliminación:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar dotación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCategorias = async (req, res) => {
  try {
    const categorias = await Dotacion.getCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías.' });
  }
};

const getSubcategorias = async (req, res) => {
  try {
    const subcategorias = await Dotacion.getSubcategorias();
    res.json(subcategorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategorías.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getCategorias,
  getSubcategorias
};
