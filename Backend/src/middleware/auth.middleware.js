const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * @description Middleware de autenticación JWT con verificación de token inválido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Permitir endpoints públicos
    const publicRoutes = [
      { path: '/setup-first-admin', method: 'POST' },
      { path: '/login', method: 'POST' },
      { path: '/healthcheck', method: 'GET' }
    ];

    const isPublicRoute = publicRoutes.some(
      route => route.path === req.path && route.method === req.method
    );

    if (isPublicRoute) {
      return next();
    }

    // Verificar token
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticación requerido',
        code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar si el token está en la lista negra
    const [invalidToken] = await pool.query(
      'SELECT 1 FROM tokens_invalidados WHERE token = ? AND fecha_expiracion > NOW()',
      [token]
    );

    if (invalidToken.length > 0) {
      return res.status(403).json({
        error: 'Token inválido (sesión cerrada)',
        code: 'INVALIDATED_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar y decodificar el token JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        let errorMessage = 'Token inválido';
        let errorCode = 'INVALID_TOKEN';

        if (err.name === 'TokenExpiredError') {
          errorMessage = 'Token expirado';
          errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          errorMessage = 'Token malformado';
          errorCode = 'MALFORMED_TOKEN';
        }

        return res.status(403).json({
          error: errorMessage,
          code: errorCode,
          timestamp: new Date().toISOString()
        });
      }

      // Añadir información del usuario al request
      req.usuario = {
        ...decoded,
        sessionId: decoded.sessionId || uuidv4() // Para rastreo de sesión
      };

      // Registrar acceso en la base de datos
      pool.query(
        'INSERT INTO accesos_token (token, id_usuario, ruta, metodo) VALUES (?, ?, ?, ?)',
        [token, decoded.id_usuario, req.path, req.method]
      ).catch(console.error);

      next();
    });

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al autenticar',
      code: 'AUTHENTICATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = authenticateToken;