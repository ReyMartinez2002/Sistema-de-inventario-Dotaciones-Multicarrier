-- Elimina tablas si existen, para evitar conflictos (puedes quitar estas líneas si solo quieres crear)
DROP TABLE IF EXISTS movimientos_dotacion;
DROP TABLE IF EXISTS dotacion_estado_historial;
DROP TABLE IF EXISTS historial_asignaciones;
DROP TABLE IF EXISTS dotaciones;
DROP TABLE IF EXISTS subcategorias_dotacion;
DROP TABLE IF EXISTS categorias_dotacion;
DROP TABLE IF EXISTS empleados;
DROP TABLE IF EXISTS usuarios_login_historial;
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS usuarios_login;
DROP TABLE IF EXISTS roles;

-- Tabla de roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Inserta los roles sugeridos
INSERT INTO roles (nombre, descripcion) VALUES
('superadmin', 'Acceso total y creación de usuarios'),
('admin', 'Gestión completa de dotaciones y empleados, pero no usuarios'),
('viewer', 'Solo visualización y descarga de reportes');

-- Usuarios administrativos (login)
CREATE TABLE usuarios_login (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    id_rol INT,
    estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Historial de acceso de usuarios administrativos
CREATE TABLE usuarios_login_historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_acceso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_acceso VARCHAR(45),
    exito BOOLEAN NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla de empleados
CREATE TABLE empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    cargo VARCHAR(50) NOT NULL,
    edad INT,
    fecha_ingreso DATE,
    fecha_retiro DATE,
    estado ENUM('activo','retirado') NOT NULL DEFAULT 'activo',
    foto VARCHAR(255)
);

-- Auditoría general (logs de acciones administrativas)
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tabla_afectada VARCHAR(50),
    id_registro_afectado INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Categorías de dotación (Pantalón, Camisa, etc.)
CREATE TABLE categorias_dotacion (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Subcategorías de dotación
CREATE TABLE subcategorias_dotacion (
    id_subcategoria INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_categoria) REFERENCES categorias_dotacion(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Dotaciones (stock por tipo y subcategoría)
CREATE TABLE dotaciones (
    id_dotacion INT AUTO_INCREMENT PRIMARY KEY,
    id_subcategoria INT NOT NULL,
    descripcion VARCHAR(150),
    genero VARCHAR(20),
    estado ENUM('nuevo', 'reutilizable', 'dañado', 'devuelto'),
    stock_nuevo INT DEFAULT 0,
    stock_reutilizable INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    precio_unitario DECIMAL(10,2) DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    eliminado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_subcategoria) REFERENCES subcategorias_dotacion(id_subcategoria)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Historial de cambios de estado en dotaciones
CREATE TABLE dotacion_estado_historial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_dotacion INT NOT NULL,
    estado_anterior ENUM('nuevo', 'reutilizable', 'dañado', 'devuelto'),
    estado_nuevo ENUM('nuevo', 'reutilizable', 'dañado', 'devuelto'),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_dotacion) REFERENCES dotaciones(id_dotacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Movimientos de dotaciones (entradas, salidas, devoluciones)
CREATE TABLE movimientos_dotacion (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_dotacion INT NOT NULL,
    id_empleado INT NOT NULL,
    id_usuario INT NOT NULL, -- Usuario administrativo responsable
    tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'DEVOLUCION'),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cantidad INT NOT NULL,
    estado_post_movimiento ENUM('nuevo', 'reutilizable', 'dañado', 'devuelto'),
    observaciones TEXT,
    archivo_adjunto VARCHAR(255), -- ruta o nombre de archivo adjunto
    FOREIGN KEY (id_dotacion) REFERENCES dotaciones(id_dotacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Historial de asignaciones (quién tuvo qué y cuándo, y quién realizó la acción)
CREATE TABLE historial_asignaciones (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_dotacion INT NOT NULL,
    id_empleado INT NOT NULL,
    id_usuario_entrega INT NOT NULL, -- Usuario administrativo que realiza la entrega
    fecha_entrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion DATETIME,
    id_usuario_devolucion INT NULL, -- Usuario administrativo que recibe la devolución
    estado_al_devolver ENUM('nuevo', 'reutilizable', 'dañado', 'devuelto'),
    observaciones TEXT,
    archivo_adjunto VARCHAR(255),
    FOREIGN KEY (id_dotacion) REFERENCES dotaciones(id_dotacion)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario_entrega) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario_devolucion) REFERENCES usuarios_login(id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Índices para optimización de consultas
CREATE INDEX idx_empleados_documento ON empleados(documento);
CREATE INDEX idx_usuarios_login_username ON usuarios_login(username);
CREATE INDEX idx_dotaciones_estado ON dotaciones(estado);
CREATE INDEX idx_movimientos_dotacion_tipo ON movimientos_dotacion(tipo_movimiento);
CREATE INDEX idx_historial_asignaciones_fecha_entrega ON historial_asignaciones(fecha_entrega);

-- Ejemplo de tabla para adjuntos (si quieres guardar varios por movimiento/asignación)
CREATE TABLE archivos_adjuntos (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    tipo_tabla ENUM('movimiento','asignacion') NOT NULL,
    id_tabla INT NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT
);