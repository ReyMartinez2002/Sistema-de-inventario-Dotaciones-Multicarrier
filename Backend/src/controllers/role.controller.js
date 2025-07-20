const Role = require('../models/role.model');
const logger = require('../utils/logger');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    logger.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(role);
  } catch (error) {
    logger.error('Error al obtener rol:', error);
    res.status(500).json({ error: 'Error al obtener rol' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validar que el nombre sea único
    const existingRole = await Role.findByName(nombre);
    if (existingRole) {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }
    
    const roleId = await Role.create({ nombre, descripcion });
    
    // Registrar en auditoría
    await req.auditLog(`Creó nuevo rol: ${nombre}`, 'roles', roleId);
    
    res.status(201).json({ message: 'Rol creado exitosamente', id: roleId });
  } catch (error) {
    logger.error('Error al crear rol:', error);
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const affectedRows = await Role.update(id, { nombre, descripcion });
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    // Registrar en auditoría
    await req.auditLog(`Actualizó rol ID: ${id}`, 'roles', id);
    
    res.json({ message: 'Rol actualizado exitosamente' });
  } catch (error) {
    logger.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar roles básicos
    if (id <= 3) {
      return res.status(400).json({ error: 'No se pueden eliminar los roles básicos del sistema' });
    }
    
    await Role.delete(id);
    
    // Registrar en auditoría
    await req.auditLog(`Eliminó rol ID: ${id}`, 'roles', id);
    
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    if (error.message.includes('usuarios asignados')) {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};