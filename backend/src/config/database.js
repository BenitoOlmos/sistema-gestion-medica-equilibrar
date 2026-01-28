/**
 * =====================================================
 * CONFIGURACIÓN DE BASE DE DATOS MYSQL
 * Sistema: Clínica Equilibrar API
 * =====================================================
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clinica_equilibrar_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: '-03:00', // Chile timezone
});

// Test de conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✓ Conexión a MySQL establecida exitosamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('✗ Error conectando a MySQL:', error.message);
        return false;
    }
}

// Helper para ejecutar queries
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Error en query:', error.message);
        throw error;
    }
}

// Helper para transacciones
async function transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const result = await callback(connection);
        await connection.commit();
        connection.release();
        return result;
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
}

module.exports = {
    pool,
    query,
    transaction,
    testConnection
};
