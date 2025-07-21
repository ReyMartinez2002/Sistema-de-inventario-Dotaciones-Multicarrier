const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' }); // Cambia aquí el mensaje si quieres
  }
}

function isSuperAdmin(req, res, next) {
  if (req.user && req.user.rol === 'superadmin') return next();
  return res.status(403).json({ message: 'Solo superadministradores' });
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.rol)) return next();
    return res.status(403).json({ message: 'No autorizado' });
  };
}

module.exports = { verifyToken, isSuperAdmin, allowRoles };