const User = require('../models/user.model');
const Role = require('../models/role.model');
const { generateToken } = require('../utils/jwtUtils');
const { hashPassword } = require('../utils/passwordUtils');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { username, password, nombre, id_rol } = req.body;
    
    // Validar que el rol exista
    const role = await Role.findById(id_rol);
    if (!role) {
      return res.status(400).json({ error: 'Rol no válido' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Crear el usuario
    const userId = await User.create({ username, password, nombre, id_rol });
    
    // Registrar en auditoría
    await req.auditLog(`Registró nuevo usuario: ${username}`, 'usuarios_login', userId);
    
    res.status(201).json({ message: 'Usuario creado exitosamente', id: userId });
  } catch (error) {
    logger.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    logger.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_rol, estado } = req.body;
    
    // Validar que el rol exista si se está actualizando
    if (id_rol) {
      const role = await Role.findById(id_rol);
      if (!role) {
        return res.status(400).json({ error: 'Rol no válido' });
      }
    }
    
    const affectedRows = await User.update(id, { nombre, id_rol, estado });
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Registrar en auditoría
    await req.auditLog(`Actualizó usuario ID: ${id}`, 'usuarios_login', id);
    
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    logger.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir auto-eliminación
    if (req.user.id_usuario === parseInt(id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
    }
    
    const affectedRows = await User.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Registrar en auditoría
    await req.auditLog(`Desactivó usuario ID: ${id}`, 'usuarios_login', id);
    
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    logger.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const { username, dateFrom, dateTo, success } = req.query;
    
    const filters = {
      username,
      dateFrom: dateFrom ? new Date(dateFrom) : null,
      dateTo: dateTo ? new Date(dateTo) : null,
      success: success !== undefined ? success === 'true' : undefined
    };
    
    const history = await User.getAllLoginHistory(filters);
    res.json(history);
  } catch (error) {
    logger.error('Error al obtener historial de accesos:', error);
    res.status(500).json({ error: 'Error al obtener historial de accesos' });
  }
};