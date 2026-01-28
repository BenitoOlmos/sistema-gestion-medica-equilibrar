# =====================================================
# SCRIPT DE INICIO RÁPIDO - TESTING LOCAL
# =====================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    🏥 SISTEMA CLÍNICA EQUILIBRAR - TEST LOCAL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar MySQL
Write-Host "📊 Verificando MySQL..." -Fore ForegroundColor Yellow
$mysqlRunning = Get-Service MySQL* -ErrorAction SilentlyContinue | Where-Object {$_.Status -eq 'Running'}

if ($mysqlRunning) {
    Write-Host "  ✓ MySQL está corriendo" -ForegroundColor Green
} else {
    Write-Host "  ✗ MySQL NO está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACCIÓN REQUERIDA:" -ForegroundColor Yellow
    Write-Host "1. Instala MySQL: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "2. O inicia el servicio: Start-Service MySQL80" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona ENTER cuando MySQL esté corriendo"
}

# Configurar backend
Write-Host ""
Write-Host "📦 Configurando backend..." -ForegroundColor Yellow

if (Test-Path "backend/.env") {
    Write-Host "  ✓ Archivo .env existe" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edita backend/.env y cambia:" -ForegroundColor Yellow
    Write-Host "   DB_PASSWORD=TU_PASSWORD_MYSQL" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "¿Ya configuraste el password? (S/N)"
    
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-Host "Por favor edita backend/.env primero" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "  ✗ Falta crear backend/.env" -ForegroundColor Red
    Write-Host "  Copia backend/.env.example a backend/.env" -ForegroundColor Yellow
    exit
}

# Verificar base de datos
Write-Host ""
Write-Host "🗄️  Verificando base de datos..." -ForegroundColor Yellow
Write-Host "¿Ya ejecutaste el schema SQL? (migration/01_create_schema.sql)" -ForegroundColor White
$dbReady = Read-Host "(S/N)"

if ($dbReady -ne "S" -and $dbReady -ne "s") {
    Write-Host ""
    Write-Host "Ejecuta este comando en MySQL:" -ForegroundColor Yellow
    Write-Host "mysql -u root -p < migration/01_create_schema.sql" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona ENTER cuando esté listo"
}

# Iniciar backend
Write-Host ""
Write-Host "🚀 Iniciando backend en http://localhost:8080..." -ForegroundColor Green
Write-Host ""

cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& 'C:\Program Files\nodejs\npm.cmd' run dev"

Start-Sleep -Seconds 3

# Probar health
Write-Host "🔍 Probando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
    Write-Host "  ✓ Backend respondiendo correctamente!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend aún no responde (puede tomar unos segundos)" -ForegroundColor Yellow
}

# Iniciar frontend
Write-Host ""
Write-Host "🎨 ¿Iniciar también el frontend? (S/N)" -ForegroundColor Yellow
$startFrontend = Read-Host

if ($startFrontend -eq "S" -or $startFrontend -eq "s") {
    cd ..
    Write-Host "Iniciando frontend en http://localhost:3001..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& 'C:\Program Files\nodejs\npm.cmd' run dev"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    ✅ SISTEMA INICIADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "   Health:   http://localhost:8080/health" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Yellow
Write-Host "   - TESTING_LOCAL.md" -ForegroundColor White
Write-Host "   - ROADMAP_MEJORAS.md" -ForegroundColor White
Write-Host "   - backend/README.md" -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
