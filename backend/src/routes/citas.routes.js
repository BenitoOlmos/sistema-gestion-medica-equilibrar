/**
 * =====================================================
 * RUTAS DE CITAS
 * Sistema: Clínica Equilibrar API
 * =====================================================
 */

const express = require('express');
const { query, transaction } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

/**
 * GET /api/citas
 * Obtener todas las citas (con filtros opcionales)
 */
router.get('/', async (req, res) => {
    try {
        const {
            profesionalId,
            pacienteId,
            fechaInicio,
            fechaFin,
            estado
        } = req.query;

        let sql = `
            SELECT 
                c.id_cita,
                c.codigo_cita,
                c.fecha_inicio,
                c.fecha_fin,
                c.observaciones,
                c.id_paciente,
                c.id_profesional,
                c.id_servicio,
                c.id_estado,
                c.id_ubicacion,
                CONCAT(p.nombres, ' ', COALESCE(p.apellidos, '')) as paciente_nombre,
                p.telefono as paciente_telefono,
                pr.nombres as profesional_nombre,
                s.nombre as servicio_nombre,
                s.precio_lista as servicio_precio,
                e.descripcion as estado_descripcion,
                e.color_kpi as estado_color,
                df.precio_cobrado,
                df.monto_profesional,
                df.monto_clinica,
                CASE WHEN pg.id_pago IS NOT NULL THEN 'PAGADO' ELSE 'PENDIENTE' END as estado_pago
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN profesionales pr ON c.id_profesional = pr.id_profesional
            LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
            JOIN estados_cita e ON c.id_estado = e.id_estado
            LEFT JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
            LEFT JOIN pagos pg ON c.id_cita = pg.id_cita
            WHERE 1=1
        `;

        const params = [];

        // Filtros
        if (profesionalId) {
            sql += ' AND c.id_profesional = ?';
            params.push(profesionalId);
        }

        if (pacienteId) {
            sql += ' AND c.id_paciente = ?';
            params.push(pacienteId);
        }

        if (fechaInicio) {
            sql += ' AND DATE(c.fecha_inicio) >= ?';
            params.push(fechaInicio);
        }

        if (fechaFin) {
            sql += ' AND DATE(c.fecha_inicio) <= ?';
            params.push(fechaFin);
        }

        if (estado) {
            sql += ' AND c.id_estado = ?';
            params.push(estado);
        }

        sql += ' ORDER BY c.fecha_inicio ASC';

        const citas = await query(sql, params);

        res.json({
            status: 'success',
            data: citas,
            count: citas.length
        });

    } catch (error) {
        console.error('Error obteniendo citas:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener citas',
            error: error.message
        });
    }
});

/**
 * GET /api/citas/:id
 * Obtener una cita por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const citas = await query(
            `SELECT 
                c.*,
                CONCAT(p.nombres, ' ', COALESCE(p.apellidos, '')) as paciente_nombre,
                p.telefono as paciente_telefono,
                p.email as paciente_email,
                pr.nombres as profesional_nombre,
                s.nombre as servicio_nombre,
                df.precio_cobrado,
                df.monto_profesional,
                df.monto_clinica
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN profesionales pr ON c.id_profesional = pr.id_profesional
            LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
            LEFT JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
            WHERE c.id_cita = ?`,
            [id]
        );

        if (citas.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cita no encontrada'
            });
        }

        res.json({
            status: 'success',
            data: citas[0]
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener cita',
            error: error.message
        });
    }
});

/**
 * POST /api/citas
 * Crear nueva cita
 */
router.post('/', authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'), async (req, res) => {
    try {
        const {
            pacienteId,
            profesionalId,
            servicioId,
            estadoId,
            ubicacionId,
            fechaInicio,
            fechaFin,
            observaciones,
            precioCobrado,
            metodoPagoId
        } = req.body;

        // Validar datos requeridos
        if (!pacienteId || !profesionalId || !fechaInicio) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos incompletos: se requiere pacienteId, profesionalId y fechaInicio'
            });
        }

        // Usar transacción para crear cita + detalle financiero
        const result = await transaction(async (conn) => {
            // 1. Insertar cita
            const [citaResult] = await conn.execute(
                `INSERT INTO citas (
                    id_paciente, id_profesional, id_servicio, id_estado, 
                    id_ubicacion, fecha_inicio, fecha_fin, observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    pacienteId,
                    profesionalId,
                    servicioId || null,
                    estadoId || 1, // Default: Agendada
                    ubicacionId || 1,
                    fechaInicio,
                    fechaFin || null,
                    observaciones || null
                ]
            );

            const citaId = citaResult.insertId;

            // 2. Insertar detalle financiero si hay precio
            if (precioCobrado && precioCobrado > 0) {
                await conn.execute(
                    `INSERT INTO detalle_financiero_cita (
                        id_cita, precio_cobrado
                    ) VALUES (?, ?)`,
                    [citaId, precioCobrado]
                );
            }

            return { citaId };
        });

        res.status(201).json({
            status: 'success',
            message: 'Cita creada exitosamente',
            data: {
                citaId: result.citaId
            }
        });

    } catch (error) {
        console.error('Error creando cita:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al crear cita',
            error: error.message
        });
    }
});

/**
 * PUT /api/citas/:id
 * Actualizar cita existente
 */
router.put('/:id', authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            pacienteId,
            profesionalId,
            servicioId,
            estadoId,
            ubicacionId,
            fechaInicio,
            fechaFin,
            observaciones
        } = req.body;

        const result = await query(
            `UPDATE citas SET
                id_paciente = COALESCE(?, id_paciente),
                id_profesional = COALESCE(?, id_profesional),
                id_servicio = COALESCE(?, id_servicio),
                id_estado = COALESCE(?, id_estado),
                id_ubicacion = COALESCE(?, id_ubicacion),
                fecha_inicio = COALESCE(?, fecha_inicio),
                fecha_fin = COALESCE(?, fecha_fin),
                observaciones = COALESCE(?, observaciones)
            WHERE id_cita = ?`,
            [
                pacienteId, profesionalId, servicioId, estadoId,
                ubicacionId, fechaInicio, fechaFin, observaciones, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cita no encontrada'
            });
        }

        res.json({
            status: 'success',
            message: 'Cita actualizada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar cita',
            error: error.message
        });
    }
});

/**
 * DELETE /api/citas/:id
 * Eliminar cita
 */
router.delete('/:id', authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM citas WHERE id_cita = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cita no encontrada'
            });
        }

        res.json({
            status: 'success',
            message: 'Cita eliminada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al eliminar cita',
            error: error.message
        });
    }
});

module.exports = router;
