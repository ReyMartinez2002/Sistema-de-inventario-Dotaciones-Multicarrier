const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
  try {
    // Definir rutas públicas que no requieren autenticación
    const publicRoutes = [
      { path: '/api/auth/setup-first-admin', method: 'POST' },
      { path: '/api/auth/login', method: 'POST' },
      { path: '/api/healthcheck', method: 'GET' }
    ];

    // Permitir acceso si es una ruta pública
    const isPublicRoute = publicRoutes.some(route => route.path === req.path && route.method === req.method);
    if (isPublicRoute) return next();

    // Obtener token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticación requerido',
        code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    // Validar si el token fue invalidado (sesión cerrada)
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

    // Verificar validez del token JWT
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        const errorResponse = {
          error: 'Token inválido',
          code: 'INVALID_TOKEN',
          timestamp: new Date().toISOString()
        };

        if (err.name === 'TokenExpiredError') {
          errorResponse.error = 'Token expirado';
          errorResponse.code = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          errorResponse.error = 'Token malformado';
          errorResponse.code = 'MALFORMED_TOKEN';
        }

        return res.status(403).json(errorResponse);
      }

      // Adjuntar usuario decodificado a la solicitud
      req.usuario = {
        ...decoded,
        sessionId: decoded.sessionId || uuidv4()
      };

      // Registrar acceso
      try {
        await pool.query(
          'INSERT INTO accesos_token (token, id_usuario, ruta, metodo) VALUES (?, ?, ?, ?)',
          [token, decoded.id_usuario, req.path, req.method]
        );
      } catch (logError) {
        console.error('Error registrando acceso del token:', logError);
      }

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
