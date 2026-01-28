const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/pacientes - Listar pacientes
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `SELECT * FROM pacientes WHERE activo = 1`;
        const params = [];

        if (search) {
            sql += ` AND (nombres LIKE ? OR apellidos LIKE ? OR rut LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ` ORDER BY nombres ASC LIMIT 100`;

        const pacientes = await query(sql, params);
        res.json({ status: 'success', data: pacientes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /api/pacientes/:id - Obtener paciente
router.get('/:id', async (req, res) => {
    try {
        const pacientes = await query(
            'SELECT * FROM pacientes WHERE id_paciente = ?',
            [req.params.id]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Paciente no encontrado' });
        }

        res.json({ status: 'success', data: pacientes[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// POST /api/pacientes - Crear paciente
router.post('/', authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'), async (req, res) => {
    try {
        const { rut, nombres, apellidos, email, telefono, direccion, idPrevision, idComuna, fechaNacimiento } = req.body;

        const result = await query(
            `INSERT INTO pacientes (rut, nombres, apellidos, email, telefono, direccion, id_prevision, id_comuna, fecha_nacimiento)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rut, nombres, apellidos, email, telefono, direccion, idPrevision, idComuna, fechaNacimiento]
        );

        res.status(201).json({
            status: 'success',
            message: 'Paciente creado',
            data: { pacienteId: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// PUT /api/pacientes/:id - Actualizar paciente
router.put('/:id', authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'), async (req, res) => {
    try {
        const { nombres, apellidos, email, telefono, direccion } = req.body;

        const result = await query(
            `UPDATE pacientes SET
                nombres = COALESCE(?, nombres),
                apellidos = COALESCE(?, apellidos),
                email = COALESCE(?, email),
                telefono = COALESCE(?, telefono),
                direccion = COALESCE(?, direccion)
            WHERE id_paciente = ?`,
            [nombres, apellidos, email, telefono, direccion, req.params.id]
        );

        res.json({ status: 'success', message: 'Paciente actualizado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
