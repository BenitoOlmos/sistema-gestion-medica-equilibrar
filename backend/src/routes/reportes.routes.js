const express = require('express');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.use(authorize('ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'));

// Ingresos mensuales
router.get('/ingresos-mensuales', async (req, res) => {
    try {
        const { year } = req.query;
        const ingresos = await query(
            `SELECT 
                DATE_FORMAT(c.fecha_inicio, '%Y-%m') as mes,
                COUNT(c.id_cita) as total_citas,
                SUM(df.precio_cobrado) as ingresos_totales
            FROM citas c
            JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
            WHERE YEAR(c.fecha_inicio) = COALESCE(?, YEAR(CURDATE()))
            GROUP BY mes
            ORDER BY mes`,
            [year]
        );
        res.json({ status: 'success', data: ingresos });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
