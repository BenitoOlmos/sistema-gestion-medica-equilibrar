/**
 * =====================================================
 * RUTAS DE AUTENTICACIÓN
 * Sistema: Clínica Equilibrar API
 * =====================================================
 */

const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const users = await query(
            `SELECT u.*, r.nombre as role 
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.email = ? AND u.activo = 1`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas'
            });
        }

        // Obtener datos adicionales según el rol
        let additionalData = {};

        if (user.role === 'PROFESIONAL') {
            const profesional = await query(
                `SELECT id_profesional, nombres, id_especialidad, color_calendario 
                 FROM profesionales WHERE id_usuario = ?`,
                [user.id_usuario]
            );

            if (profesional.length > 0) {
                additionalData.specialistId = profesional[0].id_profesional;
                additionalData.specialistName = profesional[0].nombres;
            }
        }

        // Generar token
        const token = generateToken(user);

        // Actualizar último acceso
        await query(
            'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?',
            [user.id_usuario]
        );

        // Respuesta
        res.json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id_usuario,
                    email: user.email,
                    role: user.role,
                    ...additionalData
                }
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/register
 * Registrar nuevo usuario (solo para admins)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, roleId } = req.body;

        // Validar datos
        if (!email || !password || !roleId) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos incompletos'
            });
        }

        // Verificar si el email ya existe
        const existing = await query(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }

        // Hash de contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        const result = await query(
            'INSERT INTO usuarios (email, password_hash, id_rol) VALUES (?, ?, ?)',
            [email, passwordHash, roleId]
        );

        res.status(201).json({
            status: 'success',
            message: 'Usuario creado exitosamente',
            data: {
                userId: result.insertId
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/change-password
 * Cambiar contraseña (requiere estar autenticado)
 */
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // TODO: Implementar con middleware de autenticación

        res.json({
            status: 'success',
            message: 'Contraseña actualizada'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al cambiar contraseña'
        });
    }
});

module.exports = router;
