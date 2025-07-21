const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password, nombre, rol, id_rol, estado } = req.body;

    if (!username || !password || !nombre || !rol || !id_rol || !estado) {
      return res.status(400).json({ message: 'Datos obligatorios faltantes' });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({ username, password_hash, nombre, rol, id_rol, estado });

    if (!newUser) {
      // Si newUser es null o undefined, lanzamos error
      throw new Error('No se pudo obtener el usuario creado.');
    }

    const userResponse = { ...newUser };
    delete userResponse.password_hash;

    res.status(201).json(userResponse);

  } catch (err) {
    console.error('Error en createUser:', err);
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rol, id_rol, estado } = req.body;
    await User.update(id, { nombre, rol, id_rol, estado });
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

exports.changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await User.changeStatus(id, estado);
    res.json({ message: `Estado cambiado a ${estado}` });
  } catch (err) {
    res.status(500).json({ message: 'Error al cambiar estado', error: err.message });
  }
};