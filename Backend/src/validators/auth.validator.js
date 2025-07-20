const { body } = require('express-validator');

const registerSchema = [
  body('username').notEmpty().withMessage('El usuario es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  body('email').isEmail().withMessage('Email inválido')
];

const loginSchema = [
  body('username').notEmpty().withMessage('El usuario es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

module.exports = {
  registerSchema,
  loginSchema
};