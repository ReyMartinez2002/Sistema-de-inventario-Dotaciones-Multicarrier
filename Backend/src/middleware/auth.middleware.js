const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const cleanedToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token verificado:', decoded); // <--- Agrega esto
    next();
  } catch (err) {
    console.log('❌ Error al verificar token:', err.message); // <--- y esto
    return res.status(401).json({ message: 'Token inválido o expirado' });
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