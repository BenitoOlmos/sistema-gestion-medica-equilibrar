# =====================================================
# CAMBIAR DE MODO DEMO A MySQL
# =====================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    🔄 CAMBIANDO A MODO MySQL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$contextFile = "lib/context.js"

Write-Host "📝 Actualizando $contextFile..." -ForegroundColor Yellow

# Leer el archivo
$content = Get-Content $contextFile -Raw

# Reemplazar las importaciones
$content = $content -replace "import { fetchGoogleSheetsData as fetchData } from './api-demo';", "import { fetchGoogleSheetsData as fetchData } from './api';"
$content = $content -replace "import\('./api-demo'\)", "import('./api')"

# Guardar
$content | Set-Content $contextFile -NoNewline

Write-Host "✓ Archivo actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "    ✅ CAMBIO COMPLETADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Reinicia el frontend (Ctrl+C y luego npm run dev)" -ForegroundColor White
Write-Host "   2. Verifica que el backend esté corriendo (puerto 8080)" -ForegroundColor White
Write-Host "   3. Login con: admin@equilibrar.com / admin123" -ForegroundColor White
Write-Host ""
