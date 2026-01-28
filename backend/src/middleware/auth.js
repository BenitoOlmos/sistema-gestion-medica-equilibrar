/**
 * =====================================================
 * MIDDLEWARE DE AUTENTICACIÓN JWT
 * Sistema: Clínica Equilibrar API
 * =====================================================
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un token JWT
 */
function generateToken(user) {
    const payload = {
        id: user.id_usuario,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
}

/**
 * Verifica un token JWT
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Middleware para proteger rutas
 */
async function authenticate(req, res, next) {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);

        // Verificar token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                status: 'error',
                message: 'Token inválido o expirado'
            });
        }

        // Obtener usuario de la BD
        const users = await query(
            'SELECT u.*, r.nombre as role FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.id_usuario = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }

        // Agregar usuario al request
        req.user = users[0];
        next();

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error en autenticación',
            error: error.message
        });
    }
}

/**
 * Middleware para verificar roles específicos
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autenticado'
            });
        }

        const userRole = req.user.role.toUpperCase();
        const hasPermission = allowedRoles.some(role =>
            role.toUpperCase() === userRole
        );

        if (!hasPermission) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para esta acción',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
}

module.exports = {
    generateToken,
    verifyToken,
    authenticate,
    authorize
};
