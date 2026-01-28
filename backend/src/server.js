/**
 * =====================================================
 * SERVIDOR PRINCIPAL - EXPRESS.JS
 * Sistema: Clínica Equilibrar API
 * =====================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const citasRoutes = require('./routes/citas.routes');
const pacientesRoutes = require('./routes/pacientes.routes');
const profesionalesRoutes = require('./routes/profesionales.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// =====================================================
// MIDDLEWARE DE SEGURIDAD
// =====================================================

// Helmet para headers de seguridad
app.use(helmet());

// CORS configurado
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting para prevenir ataques
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Demasiadas peticiones, intenta de nuevo más tarde'
});
app.use('/api/', limiter);

// =====================================================
// MIDDLEWARE GENERAL
// =====================================================

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compresión de respuestas
app.use(compression());

// =====================================================
// RUTAS DE LA API
// =====================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint no encontrado'
    });
});

// =====================================================
// MANEJO DE ERRORES GLOBAL
// =====================================================

app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Error de validación',
            errors: err.details
        });
    }

    // Error de autenticación
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'No autorizado'
        });
    }

    // Error genérico
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// =====================================================
// INICIO DEL SERVIDOR
// =====================================================

async function startServer() {
    try {
        // Verificar conexión a la base de datos
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('No se pudo conectar a la base de datos');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('=====================================================');
            console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
            console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`🏥 API Health: http://localhost:${PORT}/health`);
            console.log('=====================================================');
            console.log('');
        });

    } catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

// Iniciar
startServer();

module.exports = app;
