# ⚡ CAMBIO RÁPIDO: DEMO → MySQL

Cuando hayas configurado MySQL, ejecuta este script para cambiar automáticamente:

```powershell
./switch-to-mysql.ps1
```

O hazlo manualmente siguiendo estos pasos:

## Cambios Manuales:

### 1. Editar `lib/context.js`

**Línea 4-5:**
```javascript
// ANTES (DEMO):
import { fetchGoogleSheetsData as fetchData } from './api-demo';

// DESPUÉS (MySQL):
import { fetchGoogleSheetsData as fetchData } from './api';
```

**Línea 55:**
```javascript
// ANTES:
const loginApi = await import('./api-demo').then(m => m.login);

// DESPUÉS:
const loginApi = await import('./api').then(m => m.login);
```

**Línea 73:**
```javascript
// ANTES:
import('./api-demo').then(m => m.logout());

// DESPUÉS:
import('./api').then(m => m.logout());
```

### 2. Reiniciar Frontend

```powershell
# Ctrl+C en la terminal del frontend
npm run dev
```

¡Listo! Ahora usarás MySQL en lugar de datos demo.
