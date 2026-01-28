# 🚀 CONFIGURACIÓN CON dbForge Studio

Ya que tienes dbForge Studio for MySQL, vamos a usarlo para configurar todo.

## PASO 1: Verificar/Crear Conexión MySQL

1. **Abre dbForge Studio**
2. **Database → New Connection**
   - Host: `localhost`
   - Port: `3306`
   - User: `root` (o el usuario que uses)
   - Password: [tu password]
   - Click **Test Connection**

Si la conexión funciona, ¡perfecto! Si no, puede que necesites instalar MySQL Server.

---

## PASO 2: Crear Base de Datos

### Opción A: Con el script SQL (RECOMENDADO)

1. En dbForge, click en **File → Open SQL Script**
2. Navega a: `C:\Users\benit\OneDrive\Escritorio\PROYECTOS\Calendario\migration\01_create_schema.sql`
3. Click en **Execute** (▶️ o F5)
4. Espera a que termine (creará 15 tablas)

### Opción B: Manual

1. Click derecho en el panel izquierdo → **New Database**
2. Name: `clinica_equilibrar_erp`
3. Charset: `utf8mb4`
4. Collation: `utf8mb4_unicode_ci`
5. Luego ejecuta el script del Paso A

---

## PASO 3: Verificar que se creó correctamente

En dbForge, expande `clinica_equilibrar_erp` y verifica que veas estas **15 tablas**:

✅ roles  
✅ especialidades  
✅ estados_cita  
✅ ubicaciones  
✅ previsiones  
✅ metodos_pago  
✅ comunas  
✅ usuarios  
✅ profesionales  
✅ pacientes  
✅ servicios  
✅ citas  
✅ detalle_financiero_cita  
✅ pagos  
✅ ficha_clinica  

---

## PASO 4: Crear Usuario Admin

Ejecuta este SQL en dbForge:

```sql
USE clinica_equilibrar_erp;

-- Crear usuario administrador
INSERT INTO usuarios (email, password_hash, id_rol) VALUES 
('admin@equilibrar.com', '$2b$10$rGPxPBXQF5Bl0K.d9.TJj.QK5YPj5JkYvV4iX.J1hV7yhLXP7dQOe', 1);

-- Verificar
SELECT u.id_usuario, u.email, r.nombre as rol 
FROM usuarios u 
JOIN roles r ON u.id_rol = r.id_rol;
```

**Credenciales:**
- Email: `admin@equilibrar.com`
- Password: `admin123`

---

## PASO 5: Configurar Backend

Edita el archivo: `backend/.env`

```env
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI    # ← Cambia esto
DB_NAME=clinica_equilibrar_erp

JWT_SECRET=desarrollo_local_secreto_temporal_12345
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
```

**Cambia `DB_PASSWORD` por la password de MySQL que usas en dbForge.**

---

## PASO 6: Iniciar Backend

Abre PowerShell en el proyecto y ejecuta:

```powershell
./start-backend.ps1
```

Deberías ver:
```
✓ Conexión a MySQL establecida exitosamente
🚀 Servidor iniciado en puerto 8080
```

---

## PASO 7: Actualizar Frontend para usar MySQL

Edita `lib/context.js` líneas 4-5:

**CAMBIAR DE:**
```javascript
// MODO DEMO: Usando datos locales (cambiar a './api' cuando MySQL esté listo)
import { fetchGoogleSheetsData as fetchData } from './api-demo';
```

**A:**
```javascript
// MODO PRODUCCIÓN: Usando MySQL API
import { fetchGoogleSheetsData as fetchData } from './api';
```

También en la línea 55 y 73, cambiar:
```javascript
// De: './api-demo'
// A: './api'
```

---

## PASO 8: Reiniciar Frontend

En la terminal donde está corriendo el frontend (puerto 3000):
- Presiona `Ctrl+C` para detener
- Ejecuta: `npm run dev`

---

## PASO 9: Probar Todo

1. **Backend:** http://localhost:8080/health
2. **Frontend:** http://localhost:3000
3. **Login:**
   - Email: `admin@equilibrar.com`
   - Password: `admin123`

---

## 🔍 Verificar en dbForge

Puedes ver los datos en tiempo real:

```sql
-- Ver usuarios
SELECT * FROM usuarios;

-- Ver citas
SELECT * FROM citas;

-- Ver pacientes
SELECT * FROM pacientes;
```

---

## ⚠️ Troubleshooting

### Error: "Can't connect to MySQL server"
- Verifica que MySQL esté corriendo
- En dbForge, haz click en tu conexión para activarla

### Error: "Access denied for user 'root'"
- Verifica el password en `backend/.env`

### Frontend sigue mostrando datos demo
- Verifica que cambiaste `api-demo` a `api` en context.js
- Reinicia el frontend

---

**¿Listo? Dime cuando hayas ejecutado el script SQL en dbForge y configurado el .env!** 🚀
