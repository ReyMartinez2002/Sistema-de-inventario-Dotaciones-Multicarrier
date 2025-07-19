const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const usuario = await User.findByUsername(username);
    if (!usuario) {
      await User.insertLoginHistory({
        username,
        exito: false,
        ip_acceso: req.ip,
        motivo: 'Usuario no encontrado'
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      await User.insertLoginHistory({
        id_usuario: usuario.id_usuario,
        exito: false,
        ip_acceso: req.ip,
        motivo: 'Contraseña incorrecta'
      });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

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
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ 
      token, 
      usuario: tokenPayload,
      message: 'Login exitoso'
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ 
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, nombre, rol, id_rol } = req.body;

    // Validaciones básicas
    if (!username || !password || !nombre || !rol || !id_rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const validRoles = ['superadmin', 'admin', 'viewer'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    const superadminExists = await User.checkSuperadminExists();
    
    if (superadminExists) {
      // Si ya existe superadmin, verificar permisos
      if (!req.usuario || req.usuario.rol !== 'superadmin') {
        return res.status(403).json({ 
          error: 'Solo superadmin puede registrar nuevos usuarios.' 
        });
      }
      
      if (rol === 'superadmin') {
        return res.status(403).json({ 
          error: 'No se pueden crear nuevos superadmins mediante este endpoint.' 
        });
      }
    } else {
      // Forzar rol de superadmin para el primer usuario
      if (rol !== 'superadmin') {
        return res.status(400).json({ 
          error: 'El primer usuario debe ser superadmin.' 
        });
      }
    }

    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ error: 'El username ya existe.' });

    const password_hash = await bcrypt.hash(password, 10);
    const id = await User.create({ username, password_hash, nombre, rol, id_rol });

    res.status(201).json({ 
      id, 
      username, 
      nombre, 
      rol, 
      id_rol,
      message: superadminExists ? 'Usuario registrado' : 'Primer superadmin creado'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.getAll();
    return res.json(usuarios);
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    return res.status(500).json({ 
      error: 'Error al obtener usuarios.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  register,
  getUsuarios
};