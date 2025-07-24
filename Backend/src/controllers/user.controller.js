const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Configuración de validaciones
exports.userValidations = {
  create: [
    // Validaciones para creación de usuario
  ],
  update: [
    // Validaciones para actualización
  ],
  changeStatus: [
    // Validaciones para cambio de estado
  ]
};

// Helper para manejar errores
const handleError = (res, err, context) => {
  console.error(`Error en ${context}:`, {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = err.code || 500;
  res.status(statusCode).json({
    success: false,
    message: `Error al ${context}`,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
};

// Helper para formatear respuesta de usuario
const formatUserResponse = (user) => {
  const { password_hash, ...userData } = user;
  return userData;
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      count: users.length,
      data: users.map(user => formatUserResponse(user))
    });
  } catch (err) {
    handleError(res, err, 'obtener usuarios');
  }
};

exports.createUser = async (req, res) => {
  try {
    // Validación de datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { username, password, nombre, rol, id_rol, estado = 'activo' } = req.body;
    if (estado && !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser "activo" o "inactivo"'
      });
    }

    // Validación de campos obligatorios
    const requiredFields = ['username', 'password', 'nombre', 'rol', 'id_rol'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos obligatorios faltantes',
        missingFields
      });
    }

    // Validar nombre de usuario único
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El nombre de usuario ya está en uso',
        suggestion: 'Intente con una variación o añada números'
      });
    }

    // Validar fortaleza de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Hash de contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = await User.create({ 
      username, 
      password_hash, 
      nombre, 
      rol, 
      id_rol, 
      estado 
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: formatUserResponse(newUser)
    });

  } catch (err) {
    handleError(res, err, 'crear usuario');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, id_rol, estado } = req.body;

    // Validar que el usuario exista
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar datos de entrada
    if (!nombre && !rol && !id_rol && !estado) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Validar que el estado sea correcto si viene en la solicitud
    if (estado && !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser "activo" o "inactivo"'
      });
    }

    // Actualizar usuario
    const updatedUser = await User.update(id, { 
      nombre, 
      rol, 
      id_rol, 
      estado 
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });

  } catch (err) {
    console.error('Error en updateUser:', err);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
};

exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea 'activo' o 'inactivo'
    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser "activo" o "inactivo"'
      });
    }

    // Verificar que el usuario no sea el mismo que está haciendo la acción
    if (req.user.id === parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes cambiar tu propio estado'
      });
    }

    // Cambiar estado
    const updatedUser = await User.changeStatus(id, estado);

    res.json({
      success: true,
      message: `Estado cambiado a ${estado}`,
      data: updatedUser
    });

  } catch (err) {
    console.error('Error en changeUserStatus:', err);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: err.message
    });
  }
};