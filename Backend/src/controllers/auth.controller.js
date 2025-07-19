const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * @description Inicia sesión de un usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Validación básica de entrada
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const usuario = await User.findByUsername(username);
    if (!usuario) {
      await User.insertLoginHistory({
        username,
        exito: false,
        ip_acceso: req.ip,
        motivo: 'Usuario no encontrado'
      });
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      await User.insertLoginHistory({
        id_usuario: usuario.id_usuario,
        exito: false,
        ip_acceso: req.ip,
        motivo: 'Contraseña incorrecta'
      });
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar si el usuario está activo
    if (usuario.estado !== 'activo') {
      await User.insertLoginHistory({
        id_usuario: usuario.id_usuario,
        exito: false,
        ip_acceso: req.ip,
        motivo: 'Cuenta inactiva'
      });
      return res.status(403).json({ 
        error: 'Tu cuenta está inactiva. Contacta al administrador.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Registrar login exitoso
    await User.insertLoginHistory({
      id_usuario: usuario.id_usuario,
      exito: true,
      ip_acceso: req.ip
    });

    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      id_rol: usuario.id_rol,
      sessionId: uuidv4()
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ 
      success: true,
      token, 
      usuario: tokenPayload,
      expiresIn: JWT_EXPIRES_IN,
      message: 'Login exitoso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ 
      error: 'Error en el servidor',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @description Registra un nuevo usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const register = async (req, res) => {
  try {
    const { username, password, nombre, rol, id_rol, email } = req.body;

    // Validaciones básicas
    if (!username || !password || !nombre || !rol || !id_rol) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios.',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres.',
        code: 'WEAK_PASSWORD'
      });
    }

    const validRoles = ['superadmin', 'admin', 'viewer'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol no válido.',
        code: 'INVALID_ROLE'
      });
    }

    const superadminExists = await User.checkSuperadminExists();
    
    if (superadminExists) {
      // Si ya existe superadmin, verificar permisos
      if (!req.usuario || req.usuario.rol !== 'superadmin') {
        return res.status(403).json({ 
          error: 'Solo superadmin puede registrar nuevos usuarios.',
          code: 'UNAUTHORIZED_REGISTER'
        });
      }
      
      if (rol === 'superadmin') {
        return res.status(403).json({ 
          error: 'No se pueden crear nuevos superadmins mediante este endpoint.',
          code: 'SUPERADMIN_CREATION_RESTRICTED'
        });
      }
    } else {
      // Forzar rol de superadmin para el primer usuario
      if (rol !== 'superadmin') {
        return res.status(400).json({ 
          error: 'El primer usuario debe ser superadmin.',
          code: 'FIRST_USER_MUST_BE_SUPERADMIN'
        });
      }
    }

    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ 
      error: 'El username ya existe.',
      code: 'USERNAME_EXISTS'
    });

    const password_hash = await bcrypt.hash(password, 10);
    const id = await User.create({ 
      username, 
      password_hash, 
      nombre, 
      rol, 
      id_rol,
      email: email || username // Usar email si se proporciona, de lo contrario username
    });

    // Registrar en auditoría
    await User.insertAuditLog({
      id_usuario: req.usuario?.id_usuario || 0, // 0 para sistema
      accion: 'REGISTER',
      tabla: 'usuarios_login',
      id_registro: id,
      valores_anteriores: null,
      valores_nuevos: JSON.stringify({ username, nombre, rol, id_rol })
    });

    res.status(201).json({ 
      success: true,
      id, 
      username, 
      nombre, 
      rol, 
      id_rol,
      message: superadminExists ? 'Usuario registrado' : 'Primer superadmin creado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario.',
      code: 'REGISTRATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @description Obtiene todos los usuarios (solo para superadmin/admin)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.getAll();
    
    // Registrar en auditoría
    await User.insertAuditLog({
      id_usuario: req.usuario.id_usuario,
      accion: 'GET_ALL_USERS',
      tabla: 'usuarios_login',
      id_registro: null,
      valores_anteriores: null,
      valores_nuevos: null
    });

    return res.json({
      success: true,
      data: usuarios,
      count: usuarios.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    return res.status(500).json({ 
      error: 'Error al obtener usuarios.',
      code: 'FETCH_USERS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @description Cierra la sesión del usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.decode(token);
    
    // Registrar logout
    await User.insertLogoutHistory({
      id_usuario: decoded.id_usuario,
      token: token,
      ip_logout: req.ip,
      sessionId: decoded.sessionId
    });

    // Invalidar token
    await User.invalidateToken(token, new Date(decoded.exp * 1000));

    // Registrar en auditoría
    await User.insertAuditLog({
      id_usuario: decoded.id_usuario,
      accion: 'LOGOUT',
      tabla: 'usuarios_login',
      id_registro: decoded.id_usuario,
      valores_anteriores: null,
      valores_nuevos: null
    });

    res.status(200).json({ 
      success: true,
      message: 'Sesión cerrada correctamente',
      logoutId: uuidv4(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      error: 'Error al cerrar sesión',
      code: 'LOGOUT_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  login,
  register,
  getUsuarios,
  logout
};