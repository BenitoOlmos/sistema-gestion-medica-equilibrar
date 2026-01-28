-- =====================================================
-- SISTEMA ERP CLÍNICO - SCHEMA RELACIONAL NORMALIZADO
-- Base de Datos: clinica_equilibrar_erp
-- Codificación: UTF8MB4
-- Motor: InnoDB
-- =====================================================

CREATE DATABASE IF NOT EXISTS clinica_equilibrar_erp 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE clinica_equilibrar_erp;

-- =====================================================
-- TABLAS MAESTRAS Y CATÁLOGOS (Orden de dependencias)
-- =====================================================

-- 1. Roles de Usuario
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Especialidades Médicas
CREATE TABLE especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Estados de Cita
CREATE TABLE estados_cita (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE,
    descripcion VARCHAR(50) NOT NULL,
    color_kpi VARCHAR(7) DEFAULT '#6366F1',
    activo BOOLEAN DEFAULT 1,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Ubicaciones (Presencial/Virtual)
CREATE TABLE ubicaciones (
    id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    es_virtual BOOLEAN DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    INDEX idx_virtual (es_virtual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Previsiones de Salud
CREATE TABLE previsiones (
    id_prevision INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) COMMENT 'FONASA, ISAPRE, PARTICULAR',
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Métodos de Pago
CREATE TABLE metodos_pago (
    id_metodo_pago INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo_pago VARCHAR(50) COMMENT 'EFECTIVO, TRANSFERENCIA, TARJETA, OTRO',
    activo BOOLEAN DEFAULT 1,
    INDEX idx_tipo (tipo_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Comunas
CREATE TABLE comunas (
    id_comuna INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- USUARIOS Y STAFF MÉDICO
-- =====================================================

-- 8. Usuarios del Sistema
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$temp1234hash', -- Bcrypt hash temporal
    id_rol INT NOT NULL,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    INDEX idx_email (email),
    INDEX idx_rol (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Profesionales de la Salud
CREATE TABLE profesionales (
    id_profesional INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE,
    rut VARCHAR(20) UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    id_especialidad INT,
    color_calendario VARCHAR(7) DEFAULT '#3B82F6',
    comision_base DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Porcentaje de comisión (0-100)',
    retencion_impuesto DECIMAL(5,3) DEFAULT 0.00 COMMENT 'Porcentaje de retención (0-100)',
    activo BOOLEAN DEFAULT 1,
    fecha_ingreso DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad),
    INDEX idx_nombres (nombres),
    INDEX idx_activo (activo),
    INDEX idx_especialidad (id_especialidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- PACIENTES
-- =====================================================

-- 10. Pacientes
CREATE TABLE pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(20) UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(150),
    telefono VARCHAR(50),
    direccion TEXT,
    id_prevision INT,
    id_comuna INT,
    fecha_nacimiento DATE,
    genero CHAR(1) COMMENT 'M/F/O',
    activo BOOLEAN DEFAULT 1,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_prevision) REFERENCES previsiones(id_prevision),
    FOREIGN KEY (id_comuna) REFERENCES comunas(id_comuna),
    INDEX idx_rut (rut),
    INDEX idx_nombres (nombres),
    INDEX idx_email (email),
    INDEX idx_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SERVICIOS Y PRESTACIONES
-- =====================================================

-- 11. Servicios Clínicos
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_lista INT NOT NULL DEFAULT 0,
    modalidad VARCHAR(50) COMMENT 'PRESENCIAL, ONLINE, HIBRIDO',
    duracion_minutos INT DEFAULT 60,
    activo BOOLEAN DEFAULT 1,
    INDEX idx_codigo (codigo),
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- OPERACIONES (AGENDA Y CITAS)
-- =====================================================

-- 12. Citas Médicas
CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    codigo_cita VARCHAR(50) UNIQUE COMMENT 'Para referencia externa',
    id_paciente INT NOT NULL,
    id_profesional INT NOT NULL,
    id_servicio INT,
    id_estado INT NOT NULL DEFAULT 1,
    id_ubicacion INT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    link_reunion VARCHAR(255) COMMENT 'URL para citas virtuales',
    observaciones TEXT,
    observacion_migrada TEXT COMMENT 'Datos históricos del CSV',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
    FOREIGN KEY (id_profesional) REFERENCES profesionales(id_profesional),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_estado) REFERENCES estados_cita(id_estado),
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_paciente (id_paciente),
    INDEX idx_profesional (id_profesional),
    INDEX idx_estado (id_estado),
    INDEX idx_codigo (codigo_cita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- FINANZAS (SEPARACIÓN CRÍTICA)
-- =====================================================

-- 13. Detalle Financiero de Citas (1:1 con citas)
CREATE TABLE detalle_financiero_cita (
    id_finanza INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT UNIQUE NOT NULL,
    precio_cobrado INT NOT NULL DEFAULT 0 COMMENT 'Precio real cobrado al paciente',
    monto_profesional INT DEFAULT 0 COMMENT 'Monto para el profesional (histórico)',
    monto_clinica INT DEFAULT 0 COMMENT 'Monto para la clínica (histórico)',
    impuesto_retenido INT DEFAULT 0 COMMENT 'Impuesto retenido (histórico)',
    descuento_aplicado INT DEFAULT 0,
    notas_financieras TEXT,
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE CASCADE,
    INDEX idx_cita (id_cita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Pagos Recibidos
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL,
    id_metodo_pago INT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto INT NOT NULL,
    numero_comprobante VARCHAR(100),
    estado_pago VARCHAR(50) DEFAULT 'CONFIRMADO' COMMENT 'CONFIRMADO, PENDIENTE, ANULADO',
    notas TEXT,
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita),
    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago),
    INDEX idx_cita (id_cita),
    INDEX idx_fecha (fecha_pago),
    INDEX idx_estado (estado_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- FICHA CLÍNICA (OPCIONAL - PARA EVOLUCIONES)
-- =====================================================

-- 15. Ficha Clínica / Evoluciones
CREATE TABLE ficha_clinica (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    id_paciente INT NOT NULL,
    observacion_clinica TEXT,
    observacion_historica TEXT COMMENT 'Del CSV legacy',
    diagnostico TEXT,
    tratamiento TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita) ON DELETE SET NULL,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
    INDEX idx_cita (id_cita),
    INDEX idx_paciente (id_paciente),
    INDEX idx_fecha (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- DATOS INICIALES MAESTROS (SEED)
-- =====================================================

-- Roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES 
    ('ADMINISTRADOR', 'Acceso total al sistema'),
    ('COORDINADOR', 'Gestión de agenda y finanzas'),
    ('PROFESIONAL', 'Acceso a su agenda y pacientes'),
    ('RECEPCION', 'Gestión de pacientes y agenda básica');

-- Estados de cita predefinidos
INSERT INTO estados_cita (codigo, descripcion, color_kpi) VALUES 
    ('AGENDADA', 'Cita Agendada', '#F59E0B'),
    ('REALIZADA', 'Cita Realizada', '#14B8A6'),
    ('BLOQUEADA', 'Horario Bloqueado', '#6B7280'),
    ('CANCELADA', 'Cita Cancelada', '#EF4444'),
    ('NO_ASISTIO', 'Paciente No Asistió', '#9CA3AF');

-- Ubicaciones por defecto
INSERT INTO ubicaciones (nombre, es_virtual) VALUES 
    ('Consulta Presencial', 0),
    ('Videollamada Online', 1);

-- Métodos de pago comunes
INSERT INTO metodos_pago (nombre, tipo_pago) VALUES 
    ('Efectivo', 'EFECTIVO'),
    ('Transferencia Bancaria', 'TRANSFERENCIA'),
    ('Tarjeta Débito', 'TARJETA'),
    ('Tarjeta Crédito', 'TARJETA'),
    ('MercadoPago/Webpay', 'OTRO');

-- Previsiones de salud comunes en Chile
INSERT INTO previsiones (nombre, tipo) VALUES 
    ('FONASA', 'FONASA'),
    ('Isapre Banmédica', 'ISAPRE'),
    ('Isapre Consalud', 'ISAPRE'),
    ('Isapre Colmena', 'ISAPRE'),
    ('Isapre Vida Tres', 'ISAPRE'),
    ('Sin Previsión / Particular', 'PARTICULAR');

-- =====================================================
-- ÍNDICES COMPUESTOS (PERFORMANCE)
-- =====================================================

CREATE INDEX idx_citas_fecha_prof ON citas(fecha_inicio, id_profesional);
CREATE INDEX idx_citas_fecha_estado ON citas(fecha_inicio, id_estado);
CREATE INDEX idx_pagos_cita_fecha ON pagos(id_cita, fecha_pago);

-- =====================================================
-- CONSTRAINTS ADICIONALES (DATA INTEGRITY)
-- =====================================================

ALTER TABLE detalle_financiero_cita 
    ADD CONSTRAINT chk_precio_positivo CHECK (precio_cobrado >= 0),
    ADD CONSTRAINT chk_montos_coherentes CHECK (
        precio_cobrado >= (monto_profesional + monto_clinica + impuesto_retenido - descuento_aplicado)
    );

ALTER TABLE pagos 
    ADD CONSTRAINT chk_monto_positivo CHECK (monto > 0);

ALTER TABLE profesionales 
    ADD CONSTRAINT chk_comision_valida CHECK (comision_base >= 0 AND comision_base <= 100),
    ADD CONSTRAINT chk_retencion_valida CHECK (retencion_impuesto >= 0 AND retencion_impuesto <= 100);

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
