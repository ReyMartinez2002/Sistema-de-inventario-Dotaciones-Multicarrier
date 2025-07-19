const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authenticateToken = (req, res, next) => {
  // Permitir el endpoint de setup-first-admin sin autenticación
  if (req.path === '/setup-first-admin' && req.method === 'POST') {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
};

module.exports = authenticateToken;