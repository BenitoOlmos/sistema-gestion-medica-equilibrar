# =====================================================
# MIGRACIÓN COMPLETA - ALL IN ONE SCRIPT
# Sistema: Clínica Equilibrar ERP
# Para: Windows PowerShell
# =====================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    MIGRACIÓN ETL - Clínica Equilibrar" -ForegroundColor Cyan
Write-Host "    CSV/Google Sheets → MySQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Variables de configuración
$MIGRATION_DIR = "migration"
$CSV_DIR = "csv_exports"
$MYSQL_USER = "root"
$MYSQL_DB = "clinica_equilibrar_erp"

# =====================================================
# PASO 0: Verificación de Pre-requisitos
# =====================================================

Write-Host "[PASO 0] Verificando pre-requisitos..." -ForegroundColor Yellow
Write-Host ""

python "$MIGRATION_DIR/03_pre_migration_validator.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ PRE-REQUISITOS NO CUMPLIDOS" -ForegroundColor Red
    Write-Host "   Instala las dependencias:" -ForegroundColor Red
    Write-Host "   pip install -r migration/requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Read-Host "✓ Pre-requisitos OK. Presiona ENTER para continuar"

# =====================================================
# PASO 1: Exportar Google Sheets (Opcional)
# =====================================================

Write-Host ""
Write-Host "[PASO 1] ¿Necesitas exportar desde Google Sheets?" -ForegroundColor Yellow
$export = Read-Host "S/N (Si ya tienes los CSV, escribe N)"

if ($export -eq "S" -or $export -eq "s") {
    Write-Host ""
    Write-Host "Ejecutando exportación..." -ForegroundColor Green
    python "$MIGRATION_DIR/00_export_sheets_to_csv.py"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en exportación" -ForegroundColor Red
        exit 1
    }
}

# =====================================================
# PASO 2: Crear Schema en MySQL
# =====================================================

Write-Host ""
Write-Host "[PASO 2] Creando schema en MySQL..." -ForegroundColor Yellow
Write-Host ""

$password = Read-Host "Ingresa password de MySQL" -AsSecureString
$password_plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host "Ejecutando script SQL..." -ForegroundColor Green

# Crear base de datos
echo $password_plain | mysql -u $MYSQL_USER -p --execute="CREATE DATABASE IF NOT EXISTS $MYSQL_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar schema
Get-Content "$MIGRATION_DIR/01_create_schema.sql" | mysql -u $MYSQL_USER -p$password_plain

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error creando schema" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Schema creado exitosamente" -ForegroundColor Green

# =====================================================
# PASO 3: Ejecutar Migración ETL
# =====================================================

Write-Host ""
Write-Host "[PASO 3] Ejecutando migración ETL..." -ForegroundColor Yellow
Write-Host ""

python "$MIGRATION_DIR/02_etl_migration.py" --csv-path "./$CSV_DIR" --db-password $password_plain

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error en migración ETL" -ForegroundColor Red
    Write-Host "   Revisa migration.log para detalles" -ForegroundColor Yellow
    
    $rollback = Read-Host "¿Deseas hacer rollback? (S/N)"
    if ($rollback -eq "S" -or $rollback -eq "s") {
        Get-Content "$MIGRATION_DIR/99_rollback.sql" | mysql -u $MYSQL_USER -p$password_plain $MYSQL_DB
        Write-Host "✓ Rollback ejecutado" -ForegroundColor Green
    }
    
    exit 1
}

Write-Host ""
Write-Host "✓ Migración ETL completada" -ForegroundColor Green

# =====================================================
# PASO 4: Verificación Post-Migración
# =====================================================

Write-Host ""
Write-Host "[PASO 4] Ejecutando verificación post-migración..." -ForegroundColor Yellow
Write-Host ""

python "$MIGRATION_DIR/04_post_migration_verification.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  La verificación detectó algunos problemas" -ForegroundColor Yellow
    Write-Host "   Revisa el reporte arriba" -ForegroundColor Yellow
}

# =====================================================
# PASO 5: Crear Backup
# =====================================================

Write-Host ""
Write-Host "[PASO 5] Creando backup de seguridad..." -ForegroundColor Yellow

$backup_file = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

mysqldump -u $MYSQL_USER -p$password_plain $MYSQL_DB > $backup_file

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backup guardado en: $backup_file" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo crear backup" -ForegroundColor Yellow
}

# =====================================================
# RESUMEN FINAL
# =====================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    ✅ MIGRACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifica los datos en MySQL:" -ForegroundColor White
Write-Host "   mysql -u $MYSQL_USER -p $MYSQL_DB" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Prueba queries de ejemplo:" -ForegroundColor White
Write-Host "   mysql -u $MYSQL_USER -p $MYSQL_DB < migration/queries_ejemplos.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Actualiza tu aplicación para usar MySQL" -ForegroundColor White
Write-Host ""
Write-Host "📁 Archivos generados:" -ForegroundColor Yellow
Write-Host "   - Backup: $backup_file" -ForegroundColor Gray
Write-Host "   - Log: migration.log" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Presiona ENTER para salir"
