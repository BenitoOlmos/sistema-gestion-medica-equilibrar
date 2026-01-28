# =====================================================
# SCRIPT DE INICIALIZACIÓN RÁPIDA - MySQL
# =====================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    CONFIGURACIÓN INICIAL - MySQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar password de MySQL
$mysqlPassword = Read-Host "Ingresa la password de MySQL root que configuraste" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
$mysqlPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "📊 Creando base de datos..." -ForegroundColor Yellow

# Crear base de datos y ejecutar schema
$sqlCommands = @"
CREATE DATABASE IF NOT EXISTS clinica_equilibrar_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinica_equilibrar_erp;
SOURCE $PWD/migration/01_create_schema.sql;
"@

$sqlCommands | mysql -u root -p$mysqlPass 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Base de datos creada exitosamente" -ForegroundColor Green
}
else {
    Write-Host "✗ Error creando base de datos" -ForegroundColor Red
    Write-Host "Ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < migration/01_create_schema.sql" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "📝 Configurando backend/.env..." -ForegroundColor Yellow

# Actualizar .env con la password
$envContent = @"
# =====================================================
# CONFIGURACIÓN BACKEND API - DESARROLLO LOCAL
# =====================================================

NODE_ENV=development
PORT=8080

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$mysqlPass
DB_NAME=clinica_equilibrar_erp

# JWT
JWT_SECRET=desarrollo_local_secreto_temporal_cambiar_en_produccion_12345
JWT_EXPIRES_IN=24h

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath "backend/.env" -Encoding UTF8

Write-Host "✓ backend/.env configurado" -ForegroundColor Green

Write-Host ""
Write-Host "👤 Creando usuario administrador..." -ForegroundColor Yellow

# Crear usuario admin
$adminSql = @"
USE clinica_equilibrar_erp;
INSERT INTO usuarios (email, password_hash, id_rol) VALUES 
('admin@equilibrar.com', '\$2b\$10\$rGPxPBXQF5Bl0K.d9.TJj.QK5YPj5JkYvV4iX.J1hV7yhLXP7dQOe', 1)
ON DUPLICATE KEY UPDATE email=email;
"@

$adminSql | mysql -u root -p$mysqlPass

Write-Host "✓ Usuario creado: admin@equilibrar.com / admin123" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    ✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Datos de acceso:" -ForegroundColor Yellow
Write-Host "   Email: admin@equilibrar.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Siguiente paso: Ejecuta './start-backend.ps1'" -ForegroundColor Green
Write-Host ""
