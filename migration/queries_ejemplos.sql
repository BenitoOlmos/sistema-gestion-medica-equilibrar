-- =====================================================
-- QUERIES DE EJEMPLO - SISTEMA NUEVO
-- Sistema: Clínica Equilibrar ERP
-- =====================================================
-- Queries comunes para operar con el nuevo sistema MySQL
-- =====================================================

USE clinica_equilibrar_erp;

-- =====================================================
-- 1. CONSULTAS DE AGENDA
-- =====================================================

-- Agenda del día para un profesional
SELECT 
    c.fecha_inicio,
    c.fecha_fin,
    p.nombres AS paciente,
    p.telefono,
    s.nombre AS servicio,
    e.descripcion AS estado,
    df.precio_cobrado
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
JOIN servicios s ON c.id_servicio = s.id_servicio
JOIN estados_cita e ON c.id_estado = e.id_estado
LEFT JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
WHERE pr.nombres = 'Roberto Medina'
  AND DATE(c.fecha_inicio) = '2026-01-28'
ORDER BY c.fecha_inicio;

-- Agenda semanal completa
SELECT 
    DATE(c.fecha_inicio) AS fecha,
    TIME(c.fecha_inicio) AS hora,
    pr.nombres AS profesional,
    p.nombres AS paciente,
    s.nombre AS servicio
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
JOIN servicios s ON c.id_servicio = s.id_servicio
WHERE c.fecha_inicio BETWEEN '2026-01-27' AND '2026-02-02'
ORDER BY c.fecha_inicio;

-- Horarios disponibles (slots libres)
SELECT 
    DATE_ADD('2026-01-28 08:00:00', INTERVAL n.n HOUR) AS slot_hora
FROM (
    SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
    UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
    UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
) n
WHERE NOT EXISTS (
    SELECT 1 FROM citas c
    WHERE c.id_profesional = 1
      AND DATE(c.fecha_inicio) = '2026-01-28'
      AND HOUR(c.fecha_inicio) = HOUR(DATE_ADD('2026-01-28 08:00:00', INTERVAL n.n HOUR))
);

-- =====================================================
-- 2. REPORTES FINANCIEROS
-- =====================================================

-- Ingresos del mes
SELECT 
    DATE_FORMAT(c.fecha_inicio, '%Y-%m') AS mes,
    COUNT(c.id_cita) AS total_citas,
    SUM(df.precio_cobrado) AS ingresos_totales,
    SUM(df.monto_clinica) AS utilidad_clinica,
    SUM(df.monto_profesional) AS pago_profesionales
FROM citas c
JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
JOIN estados_cita e ON c.id_estado = e.id_estado
WHERE e.codigo = 'REALIZADA'
GROUP BY DATE_FORMAT(c.fecha_inicio, '%Y-%m')
ORDER BY mes DESC;

-- Ranking de profesionales por ingresos
SELECT 
    pr.nombres AS profesional,
    COUNT(c.id_cita) AS citas_realizadas,
    SUM(df.precio_cobrado) AS ingresos_generados,
    AVG(df.precio_cobrado) AS ticket_promedio
FROM profesionales pr
JOIN citas c ON pr.id_profesional = c.id_profesional
JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
JOIN estados_cita e ON c.id_estado = e.id_estado
WHERE e.codigo = 'REALIZADA'
  AND YEAR(c.fecha_inicio) = 2026
GROUP BY pr.id_profesional, pr.nombres
ORDER BY ingresos_generados DESC;

-- Pagos pendientes (citas realizadas sin pago registrado)
SELECT 
    c.codigo_cita,
    p.nombres AS paciente,
    p.telefono,
    c.fecha_inicio,
    df.precio_cobrado AS monto_adeudado
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
JOIN estados_cita e ON c.id_estado = e.id_estado
LEFT JOIN pagos pg ON c.id_cita = pg.id_cita
WHERE e.codigo = 'REALIZADA'
  AND pg.id_pago IS NULL
ORDER BY c.fecha_inicio DESC;

-- Detalle de pagos por método
SELECT 
    mp.nombre AS metodo_pago,
    COUNT(pg.id_pago) AS cantidad_transacciones,
    SUM(pg.monto) AS total_recaudado
FROM pagos pg
JOIN metodos_pago mp ON pg.id_metodo_pago = mp.id_metodo_pago
WHERE MONTH(pg.fecha_pago) = MONTH(CURDATE())
  AND YEAR(pg.fecha_pago) = YEAR(CURDATE())
GROUP BY mp.id_metodo_pago, mp.nombre
ORDER BY total_recaudado DESC;

-- =====================================================
-- 3. GESTIÓN DE PACIENTES
-- =====================================================

-- Pacientes más frecuentes
SELECT 
    p.rut,
    p.nombres,
    p.apellidos,
    p.telefono,
    COUNT(c.id_cita) AS total_citas,
    MAX(c.fecha_inicio) AS ultima_visita
FROM pacientes p
JOIN citas c ON p.id_paciente = c.id_paciente
GROUP BY p.id_paciente
ORDER BY total_citas DESC
LIMIT 20;

-- Pacientes inactivos (más de 6 meses sin cita)
SELECT 
    p.rut,
    p.nombres,
    p.apellidos,
    p.telefono,
    MAX(c.fecha_inicio) AS ultima_cita,
    DATEDIFF(CURDATE(), MAX(c.fecha_inicio)) AS dias_inactivo
FROM pacientes p
LEFT JOIN citas c ON p.id_paciente = c.id_paciente
GROUP BY p.id_paciente
HAVING MAX(c.fecha_inicio) < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
   OR MAX(c.fecha_inicio) IS NULL
ORDER BY ultima_cita DESC;

-- Historial clínico de un paciente
SELECT 
    c.fecha_inicio,
    pr.nombres AS profesional,
    s.nombre AS servicio,
    e.descripcion AS estado,
    fc.observacion_clinica,
    fc.observacion_historica
FROM citas c
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
JOIN servicios s ON c.id_servicio = s.id_servicio
JOIN estados_cita e ON c.id_estado = e.id_estado
LEFT JOIN ficha_clinica fc ON c.id_cita = fc.id_cita
WHERE c.id_paciente = (SELECT id_paciente FROM pacientes WHERE rut = '12345678-9')
ORDER BY c.fecha_inicio DESC;

-- =====================================================
-- 4. ESTADÍSTICAS Y KPIs
-- =====================================================

-- Tasa de no asistencia por mes
SELECT 
    DATE_FORMAT(c.fecha_inicio, '%Y-%m') AS mes,
    COUNT(*) AS total_citas,
    SUM(CASE WHEN e.codigo = 'NO_ASISTIO' THEN 1 ELSE 0 END) AS no_asistencias,
    ROUND(SUM(CASE WHEN e.codigo = 'NO_ASISTIO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS tasa_no_asistencia
FROM citas c
JOIN estados_cita e ON c.id_estado = e.id_estado
GROUP BY DATE_FORMAT(c.fecha_inicio, '%Y-%m')
ORDER BY mes DESC;

-- Servicios más solicitados
SELECT 
    s.nombre AS servicio,
    COUNT(c.id_cita) AS veces_agendado,
    SUM(df.precio_cobrado) AS ingresos_generados,
    AVG(df.precio_cobrado) AS precio_promedio
FROM servicios s
JOIN citas c ON s.id_servicio = c.id_servicio
JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
JOIN estados_cita e ON c.id_estado = e.id_estado
WHERE e.codigo = 'REALIZADA'
GROUP BY s.id_servicio, s.nombre
ORDER BY veces_agendado DESC;

-- Tasa de ocupación por profesional (últimos 30 días)
SELECT 
    pr.nombres AS profesional,
    COUNT(c.id_cita) AS citas_realizadas,
    ROUND(COUNT(c.id_cita) * 100.0 / (30 * 8), 2) AS tasa_ocupacion_pct
FROM profesionales pr
LEFT JOIN citas c ON pr.id_profesional = c.id_profesional 
    AND c.fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND c.fecha_inicio <= CURDATE()
WHERE pr.activo = 1
GROUP BY pr.id_profesional, pr.nombres
ORDER BY tasa_ocupacion_pct DESC;

-- =====================================================
-- 5. OPERACIONES ADMINISTRATIVAS
-- =====================================================

-- Crear una nueva cita
INSERT INTO citas (
    id_paciente, 
    id_profesional, 
    id_servicio, 
    id_estado, 
    id_ubicacion,
    fecha_inicio, 
    fecha_fin,
    observaciones
) VALUES (
    1,  -- ID del paciente
    1,  -- ID del profesional
    1,  -- ID del servicio
    1,  -- ID estado (Agendada)
    1,  -- ID ubicación
    '2026-02-01 10:00:00',
    '2026-02-01 11:00:00',
    'Primera consulta'
);

-- Registrar detalle financiero de la cita recién creada
INSERT INTO detalle_financiero_cita (
    id_cita,
    precio_cobrado,
    monto_profesional,
    monto_clinica,
    impuesto_retenido
) VALUES (
    LAST_INSERT_ID(),  -- ID de la cita recién creada
    35000,
    24500,
    10000,
    500
);

-- Registrar un pago
INSERT INTO pagos (
    id_cita,
    id_metodo_pago,
    fecha_pago,
    monto,
    estado_pago
) VALUES (
    123,  -- ID de la cita
    1,    -- ID método pago (Efectivo)
    CURDATE(),
    35000,
    'CONFIRMADO'
);

-- Cancelar una cita
UPDATE citas 
SET id_estado = (SELECT id_estado FROM estados_cita WHERE codigo = 'CANCELADA')
WHERE id_cita = 123;

-- Bloquear un horario
INSERT INTO citas (
    id_paciente,
    id_profesional,
    id_estado,
    fecha_inicio,
    fecha_fin,
    observaciones
) VALUES (
    (SELECT id_paciente FROM pacientes LIMIT 1),  -- Paciente dummy
    1,  -- ID profesional
    (SELECT id_estado FROM estados_cita WHERE codigo = 'BLOQUEADA'),
    '2026-02-01 14:00:00',
    '2026-02-01 15:00:00',
    'Reunión administrativa'
);

-- =====================================================
-- 6. BÚSQUEDAS Y FILTROS
-- =====================================================

-- Buscar paciente por nombre o RUT
SELECT 
    id_paciente,
    rut,
    CONCAT(nombres, ' ', apellidos) AS nombre_completo,
    telefono,
    email
FROM pacientes
WHERE nombres LIKE '%María%'
   OR apellidos LIKE '%González%'
   OR rut LIKE '%12345678%'
LIMIT 10;

-- Citas de hoy
SELECT 
    TIME(c.fecha_inicio) AS hora,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
    pr.nombres AS profesional,
    s.nombre AS servicio,
    e.descripcion AS estado
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
JOIN servicios s ON c.id_servicio = s.id_servicio
JOIN estados_cita e ON c.id_estado = e.id_estado
WHERE DATE(c.fecha_inicio) = CURDATE()
ORDER BY c.fecha_inicio;

-- =====================================================
-- 7. VIEWS ÚTILES (CREAR UNA VEZ)
-- =====================================================

-- Vista completa de citas con toda la información
CREATE OR REPLACE VIEW v_citas_completas AS
SELECT 
    c.id_cita,
    c.codigo_cita,
    c.fecha_inicio,
    c.fecha_fin,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
    p.telefono AS paciente_telefono,
    p.email AS paciente_email,
    pr.nombres AS profesional,
    esp.nombre AS especialidad,
    s.nombre AS servicio,
    e.descripcion AS estado,
    e.color_kpi AS estado_color,
    u.nombre AS ubicacion,
    df.precio_cobrado,
    df.monto_profesional,
    df.monto_clinica,
    CASE WHEN pg.id_pago IS NOT NULL THEN 'PAGADO' ELSE 'PENDIENTE' END AS estado_pago,
    c.observaciones
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
JOIN especialidades esp ON pr.id_especialidad = esp.id_especialidad
LEFT JOIN servicios s ON c.id_servicio = s.id_servicio
JOIN estados_cita e ON c.id_estado = e.id_estado
LEFT JOIN ubicaciones u ON c.id_ubicacion = u.id_ubicacion
LEFT JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
LEFT JOIN pagos pg ON c.id_cita = pg.id_cita;

-- Usar la vista
SELECT * FROM v_citas_completas 
WHERE DATE(fecha_inicio) = CURDATE()
ORDER BY fecha_inicio;

-- =====================================================
-- FIN DE QUERIES DE EJEMPLO
-- =====================================================
