const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const profesionales = await query(
            `SELECT pr.*, esp.nombre as especialidad_nombre, u.email
             FROM profesionales pr
             LEFT JOIN especialidades esp ON pr.id_especialidad = esp.id_especialidad
             LEFT JOIN usuarios u ON pr.id_usuario = u.id_usuario
             WHERE pr.activo = 1
             ORDER BY pr.nombres`
        );
        res.json({ status: 'success', data: profesionales });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
