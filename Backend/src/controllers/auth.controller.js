const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuario = await User.findByUsername(username);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }
    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      await User.insertLoginHistory({ id_usuario: usuario.id_usuario, exito: false, ip_acceso: req.ip });
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }
    await User.insertLoginHistory({ id_usuario: usuario.id_usuario, exito: true, ip_acceso: req.ip });

    // Payload seguro, nunca pongas password_hash
    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      id_rol: usuario.id_rol,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, usuario: tokenPayload });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
};
// Registro de usuario (solo superadmin puede registrar)
const register = async (req, res) => {
  try {
    // Solo superadmin puede registrar usuarios
    if (req.usuario.rol !== 'superadmin') {
      return res.status(403).json({ error: 'Solo superadmin puede registrar nuevos usuarios.' });
    }

    const { username, password, nombre, rol, id_rol } = req.body;

    // Validaciones básicas
    if (!username || !password || !nombre || !rol || !id_rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // No permitir roles no válidos
    const validRoles = ['superadmin', 'admin', 'viewer'];
    if (!validRoles.includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    // Verifica si el usuario ya existe
    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ error: 'El username ya existe.' });

    // Hashea la contraseña
    const password_hash = await bcrypt.hash(password, 10);
    const id = await User.create({ username, password_hash, nombre, rol, id_rol });

    res.status(201).json({ id, username, nombre, rol, id_rol });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.getAll();
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};


module.exports = {
  login,
  getUsuarios,
  register,
};