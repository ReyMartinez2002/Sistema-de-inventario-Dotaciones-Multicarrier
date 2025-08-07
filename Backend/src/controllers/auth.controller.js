const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        error: "Usuario y contraseña son requeridos",
        code: "MISSING_CREDENTIALS",
      });
    }

    const usuario = await User.findByUsername(username);

    if (!usuario) {
      await User.insertLoginHistory({
        id_usuario: null,
        exito: false,
        ip_acceso: req.ip,
      });
      return res.status(401).json({
        error: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      await User.insertLoginHistory({
        id_usuario: usuario.id_usuario,
        exito: false,
        ip_acceso: req.ip,
      });
      return res.status(401).json({
        error: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS",
      });
    }

    if (usuario.estado !== "activo") {
      await User.insertLoginHistory({
        id_usuario: usuario.id_usuario,
        exito: false,
        ip_acceso: req.ip,
      });
      return res.status(403).json({
        error: "Tu cuenta está inactiva. Contacta al administrador.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    await User.insertLoginHistory({
      id_usuario: usuario.id_usuario,
      exito: true,
      ip_acceso: req.ip,
    });

    const tokenPayload = {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      id_rol: usuario.id_rol,
      sessionId: uuidv4(),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      success: true,
      token,
      usuario: tokenPayload,
      expiresIn: JWT_EXPIRES_IN,
      message: "Login exitoso",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      error: "Error en el servidor",
      code: "SERVER_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, nombre, rol, id_rol, email } = req.body;
    if (!username || !password || !nombre || !rol || !id_rol) {
      return res
        .status(400)
        .json({
          error: "Todos los campos son obligatorios.",
          code: "MISSING_FIELDS",
        });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          error: "La contraseña debe tener al menos 8 caracteres.",
          code: "WEAK_PASSWORD",
        });
    }
    const validRoles = ["superadmin", "admin", "viewer"];
    if (!validRoles.includes(rol)) {
      return res
        .status(400)
        .json({ error: "Rol no válido.", code: "INVALID_ROLE" });
    }
    const superadminExists = await User.checkSuperadminExists();
    if (superadminExists) {
      if (!req.user || req.user.rol !== "superadmin") {
        return res
          .status(403)
          .json({
            error: "Solo superadmin puede registrar nuevos usuarios.",
            code: "UNAUTHORIZED_REGISTER",
          });
      }
      if (rol === "superadmin") {
        return res
          .status(403)
          .json({
            error:
              "No se pueden crear nuevos superadmins mediante este endpoint.",
            code: "SUPERADMIN_CREATION_RESTRICTED",
          });
      }
    } else {
      if (rol !== "superadmin") {
        return res
          .status(400)
          .json({
            error: "El primer usuario debe ser superadmin.",
            code: "FIRST_USER_MUST_BE_SUPERADMIN",
          });
      }
    }
    const existing = await User.findByUsername(username);
    if (existing)
      return res
        .status(409)
        .json({ error: "El username ya existe.", code: "USERNAME_EXISTS" });
    const password_hash = await bcrypt.hash(password, 10);
    const id = await User.create({
      username,
      password_hash,
      nombre,
      rol,
      id_rol,
      email: email || username,
    });
    // Auditoría si tienes función en User.insertAuditLog
    res
      .status(201)
      .json({
        success: true,
        id,
        username,
        nombre,
        rol,
        id_rol,
        message: superadminExists
          ? "Usuario registrado"
          : "Primer superadmin creado",
        timestamp: new Date().toISOString(),
      });
  } catch (error) {
    console.error("Error en registro:", error);
    res
      .status(500)
      .json({
        error: "Error al registrar usuario.",
        code: "REGISTRATION_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
        timestamp: new Date().toISOString(),
      });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(200).json({
        success: true,
        message: "Sesión cerrada (sin token)",
      });
    }

    try {
      // Verificar y decodificar el token primero
      const decoded = jwt.verify(token, JWT_SECRET);

      // Invalidar el token en Redis sin importar si está expirado
      await setAsync(`blacklist:${token}`, "logged_out");
      await expireAsync(`blacklist:${token}`, TOKEN_BLACKLIST_TTL);

      await User.insertLogoutHistory({
        id_usuario: decoded.id_usuario,
        token_id: decoded.sessionId,
        ip_address: req.ip,
        logout_time: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: "Sesión cerrada correctamente",
        // Agregar estas propiedades para el frontend
        logoutAction: "clearAndRedirect",
        redirectTo: "/login?logout=success",
      });
    } catch (error) {
      // Si el token es inválido o expirado, igual consideramos logout exitoso
      return res.status(200).json({
        success: true,
        message: "Sesión cerrada (token inválido/expirado)",
        logoutAction: "clearAndRedirect",
        redirectTo: "/login?logout=success",
      });
    }
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(200).json({
      success: true,
      message: "Sesión cerrada (con errores)",
      logoutAction: "clearAndRedirect",
      redirectTo: "/login?logout=error",
    });
  }
};

// Middleware para verificar tokens blacklisted
const checkTokenBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    const isBlacklisted = await getAsync(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        error: "Token invalidado. Por favor inicie sesión nuevamente.",
        code: "TOKEN_REVOKED",
      });
    }
  }

  next();
};

const validateToken = async (req, res) => {
  try {
    // Cambia req.usuario por req.user
    res.status(200).json({
      id_usuario: req.user.id_usuario,
      username: req.user.username,
      nombre: req.user.nombre,
      rol: req.user.rol,
      id_rol: req.user.id_rol,
      email: req.user.email || req.user.username,
    });
  } catch (error) {
    res.status(500).json({ error: "Error validando token." });
  }
};
// Puedes agregar otros controladores como getUsuarios, validateToken si necesitas

module.exports = {
  login,
  register,
  logout,
  validateToken,
  checkTokenBlacklist,
};
