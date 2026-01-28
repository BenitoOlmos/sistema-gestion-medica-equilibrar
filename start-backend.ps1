# =====================================================
# INICIAR BACKEND API
# =====================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    🚀 INICIANDO BACKEND API" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

cd backend

Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\npm.cmd" install
}

Write-Host ""
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host "   Backend estará en: http://localhost:8080" -ForegroundColor White
Write-Host "   Health check: http://localhost:8080/health" -ForegroundColor White
Write-Host ""
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" run dev
