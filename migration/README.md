# 📊 MIGRACIÓN ETL: Google Sheets/CSV → MySQL

Sistema de Gestión Médica Equilibrar - Migración de Base de Datos

## 🎯 Objetivo

Migrar un sistema heredado basado en archivos CSV planos (exportados de Google Sheets) a una base de datos MySQL relacional normalizada (3NF) optimizada para un ERP Clínico.

---

## 📋 Pre-requisitos

### Software Requerido

1. **MySQL Server 8.0+**
   - Descarga: https://dev.mysql.com/downloads/mysql/
   - Asegúrate que el servicio esté ejecutándose

2. **Python 3.8+**
   - Descarga: https://www.python.org/downloads/
   - Verifica con: `python --version`

3. **Paquetes Python**
   ```bash
   pip install pandas sqlalchemy pymysql python-dotenv bcrypt
   ```

### Archivos CSV Necesarios

Los siguientes archivos deben estar en la carpeta `csv_exports/`:

- `DB_CLIENTES.csv` - Datos de pacientes
- `DB_ATENCIONES.csv` - Historial de citas/atenciones
- `DB_CONFIG_EQUIPO.csv` - Profesionales y staff
- `DB_SERVICIOS.csv` - Catálogo de servicios
- `DB_USUARIOS.csv` (opcional) - Usuarios del sistema

---

## 🚀 Proceso de Migración

### PASO 1: Exportar datos de Google Sheets a CSV

#### Opción A: Descarga Manual
1. Abre tu Google Sheet
2. Para cada hoja (`DB_CLIENTES`, `DB_ATENCIONES`, etc.):
   - Archivo → Descargar → Valores separados por comas (.csv)
3. Guarda los archivos en `csv_exports/`

#### Opción B: Usando el script automatizado
```bash
# Edita primero el archivo y configura tu SHEET_ID
nano migration/00_export_sheets_to_csv.py

# Ejecuta
python migration/00_export_sheets_to_csv.py
```

### PASO 2: Crear el Schema en MySQL

```bash
# Conéctate a MySQL
mysql -u root -p

# Ejecuta el script de creación del schema
mysql> source c:/Users/benit/OneDrive/Escritorio/PROYECTOS/Calendario/migration/01_create_schema.sql

# O desde línea de comandos (Windows):
mysql -u root -p < migration/01_create_schema.sql
```

**¿Qué hace este script?**
- Crea la base de datos `clinica_equilibrar_erp`
- Crea 15 tablas normalizadas con relaciones
- Inserta datos maestros iniciales (roles, estados, métodos de pago, etc.)
- Define índices y constraints de integridad

### PASO 3: Configurar credenciales de la BD

Edita el archivo `migration/02_etl_migration.py` líneas 34-40:

```python
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',        # ← Cambia aquí
    'password': 'tu_pass',  # ← Cambia aquí
    'database': 'clinica_equilibrar_erp',
    'charset': 'utf8mb4'
}
```

### PASO 4: Ejecutar la Migración ETL

```bash
# Desde el directorio del proyecto
cd c:/Users/benit/OneDrive/Escritorio/PROYECTOS/Calendario

# Ejecutar migración
python migration/02_etl_migration.py --csv-path ./csv_exports

# Con parámetros personalizados:
python migration/02_etl_migration.py \
    --csv-path ./csv_exports \
    --db-host localhost \
    --db-user root \
    --db-password tu_password
```

**El proceso ETL hará:**

1. ✅ **Limpieza de datos**
   - Trim de espacios
   - Capitalización de nombres
   - Validación de RUTs
   - Normalización de fechas

2. ✅ **Importación de maestros dinámicos**
   - Extrae comunas únicas → tabla `comunas`
   - Extrae previsiones → tabla `previsiones`
   - Extrae especialidades → tabla `especialidades`

3. ✅ **Migración de pacientes**
   - CSV: `DB_CLIENTES` → Tabla: `pacientes`
   - Fusiona nombres/apellidos
   - Mapea previsiones y comunas a IDs

4. ✅ **Migración de staff**
   - CSV: `DB_CONFIG_EQUIPO` → Tablas: `usuarios` + `profesionales`
   - Crea cuentas con passwords hasheados (bcrypt)
   - Mapea comisiones y retenciones

5. ✅ **Migración de servicios**
   - CSV: `DB_SERVICIOS` → Tabla: `servicios`

6. ✅ **Migración de transacciones** (LA MÁS COMPLEJA)
   - CSV: `DB_ATENCIONES` → 4 destinos:
     - `citas` - Información operacional
     - `detalle_financiero_cita` - Montos históricos
     - `pagos` - Registros de pago
     - `ficha_clinica` - Observaciones médicas

### PASO 5: Verificar la Migración

```sql
-- Conectarse a MySQL
mysql -u root -p

USE clinica_equilibrar_erp;

-- Ver estadísticas
SELECT 'Pacientes' as Tabla, COUNT(*) as Total FROM pacientes
UNION ALL
SELECT 'Profesionales', COUNT(*) FROM profesionales
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios;

-- Verificar integridad referencial
SELECT 
    c.id_cita,
    p.nombres as paciente,
    pr.nombres as profesional,
    c.fecha_inicio,
    df.precio_cobrado
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN profesionales pr ON c.id_profesional = pr.id_profesional
LEFT JOIN detalle_financiero_cita df ON c.id_cita = df.id_cita
LIMIT 10;
```

---

## 📊 Estructura de la Nueva Base de Datos

### Tablas Maestras
- `roles` - Roles del sistema (Admin, Coordinador, Profesional)
- `especialidades` - Especialidades médicas
- `estados_cita` - Estados de citas (Agendada, Realizada, etc.)
- `ubicaciones` - Ubicaciones (Presencial/Virtual)
- `previsiones` - Previsiones de salud (Fonasa, Isapre, etc.)
- `metodos_pago` - Métodos de pago
- `comunas` - Comunas de Chile

### Tablas Operacionales
- `usuarios` - Usuarios del sistema
- `profesionales` - Staff médico
- `pacientes` - Base de pacientes
- `servicios` - Catálogo de servicios
- `citas` - Agenda de citas

### Tablas Financieras
- `detalle_financiero_cita` - Detalle financiero por cita
- `pagos` - Registro de pagos

### Tablas Clínicas
- `ficha_clinica` - Evoluciones y observaciones médicas

---

## 🔍 Logs y Debugging

El script genera un archivo `migration.log` con información detallada:

```bash
# Ver el log en tiempo real
tail -f migration.log

# Buscar errores
grep "ERROR" migration.log

# Buscar advertencias
grep "WARNING" migration.log
```

---

## ⚠️ Problemas Comunes

### Error: "Access denied for user..."
**Solución:** Verifica las credenciales en `DB_CONFIG` del script Python

### Error: "Can't connect to MySQL server"
**Solución:** Asegúrate que MySQL esté corriendo:
```bash
# Windows
net start MySQL80

# Verifica el puerto
netstat -an | findstr 3306
```

### Error: "Duplicate entry for key 'rut'"
**Solución:** Hay RUTs duplicados en el CSV. El script los loguea y omite.

### Error: "Unknown column 'NOMBRES'"
**Solución:** Verifica que los archivos CSV tengan los encabezados correctos.

---

## 🔐 Seguridad

- ✅ Passwords hasheados con bcrypt (salt rounds: 10)
- ✅ Uso de prepared statements (SQLAlchemy)
- ✅ Validación de datos antes de insertar
- ✅ Constraints de FK para integridad referencial

**IMPORTANTE:** Cambia el password temporal después de la migración:

```sql
-- Actualizar password para un usuario
UPDATE usuarios 
SET password_hash = '<nuevo_hash_bcrypt>' 
WHERE email = 'admin@clinica.com';
```

---

## 📈 Próximos Pasos

Después de la migración exitosa:

1. **Conectar el Frontend**
   - Actualizar `lib/googleSheets.js` para usar MySQL en lugar de Google Sheets
   - Crear API REST con Express.js o FastAPI

2. **Backup Automático**
   ```bash
   # Crear backup
   mysqldump -u root -p clinica_equilibrar_erp > backup_$(date +%Y%m%d).sql
   ```

3. **Optimización**
   - Analizar queries lentas
   - Agregar índices adicionales según uso real

4. **Monitoreo**
   - Configurar logs de MySQL
   - Implementar métricas con Grafana/Prometheus

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa `migration.log` para detalles
2. Verifica que todos los pre-requisitos estén instalados
3. Asegúrate que los archivos CSV tengan el formato correcto

**Archivos del Proyecto:**
- `01_create_schema.sql` - Schema SQL
- `02_etl_migration.py` - Script ETL principal
- `00_export_sheets_to_csv.py` - Exportador de Sheets
- `README.md` - Esta documentación

---

## ✅ Checklist de Migración

- [ ] MySQL Server instalado y corriendo
- [ ] Python 3.8+ instalado
- [ ] Paquetes Python instalados (`pip install ...`)
- [ ] Archivos CSV exportados en `csv_exports/`
- [ ] Schema SQL ejecutado en MySQL
- [ ] Credenciales configuradas en script ETL
- [ ] Script ETL ejecutado sin errores
- [ ] Verificación de datos completada
- [ ] Backup de la nueva BD creado
- [ ] Documentación de la migración guardada

---

**Fecha de Migración:** _____________
**Responsable:** _____________
**Registros Migrados:**
- Pacientes: _____
- Profesionales: _____
- Citas: _____
- Pagos: _____

---

*Generado por: Sistema de Migración ETL v1.0*
