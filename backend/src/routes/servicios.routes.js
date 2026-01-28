const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const servicios = await query(
            'SELECT * FROM servicios WHERE activo = 1 ORDER BY nombre'
        );
        res.json({ status: 'success', data: servicios });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
