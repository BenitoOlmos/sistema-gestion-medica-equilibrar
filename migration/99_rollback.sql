-- =====================================================
-- ROLLBACK SCRIPT - ELIMINACIÓN COMPLETA
-- Sistema: Clínica Equilibrar ERP
-- =====================================================
-- ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS
-- Úsalo solo si necesitas revertir completamente la migración
-- =====================================================

USE clinica_equilibrar_erp;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- VACIAR TABLAS TRANSACCIONALES (En orden inverso)
-- =====================================================

TRUNCATE TABLE ficha_clinica;
TRUNCATE TABLE pagos;
TRUNCATE TABLE detalle_financiero_cita;
TRUNCATE TABLE citas;

-- =====================================================
-- VACIAR TABLAS MAESTRAS
-- =====================================================

TRUNCATE TABLE servicios;
TRUNCATE TABLE profesionales;
TRUNCATE TABLE pacientes;
TRUNCATE TABLE usuarios;

-- =====================================================
-- ELIMINAR DATOS DINÁMICOS (Mantener los seed)
-- =====================================================

-- Eliminar comunas dinámicas (mantener las que vinieron por defecto)
-- Si quieres eliminar todas:
-- TRUNCATE TABLE comunas;

-- Eliminar previsiones dinámicas
DELETE FROM previsiones WHERE id_prevision > 6;  -- Mantener las 6 por defecto

-- Eliminar especialidades dinámicas
-- TRUNCATE TABLE especialidades;

-- =====================================================
-- REINICIAR AUTO_INCREMENT
-- =====================================================

ALTER TABLE pacientes AUTO_INCREMENT = 1;
ALTER TABLE profesionales AUTO_INCREMENT = 1;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
ALTER TABLE servicios AUTO_INCREMENT = 1;
ALTER TABLE citas AUTO_INCREMENT = 1;
ALTER TABLE detalle_financiero_cita AUTO_INCREMENT = 1;
ALTER TABLE pagos AUTO_INCREMENT = 1;
ALTER TABLE ficha_clinica AUTO_INCREMENT = 1;
ALTER TABLE especialidades AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT 
    'Pacientes' as Tabla, COUNT(*) as Registros FROM pacientes
UNION ALL
SELECT 'Profesionales', COUNT(*) FROM profesionales
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'Detalle Financiero', COUNT(*) FROM detalle_financiero_cita;

-- =====================================================
-- PARA ELIMINAR COMPLETAMENTE LA BASE DE DATOS
-- =====================================================

-- ¡DESCOMENTAR CON PRECAUCIÓN!
-- DROP DATABASE IF EXISTS clinica_equilibrar_erp;

-- =====================================================
-- FIN DEL ROLLBACK
-- =====================================================
