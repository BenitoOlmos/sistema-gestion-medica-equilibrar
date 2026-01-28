# ✅ CHECKLIST: De DEMO a MySQL (con dbForge)

Sigue estos pasos en orden:

## ☑️ PASO 1: Configurar Base de Datos en dbForge

1. [ ] Abre **dbForge Studio for MySQL**
2. [ ] Verifica/crea conexión a `localhost:3306`
3. [ ] Abre el script: `migration/01_create_schema.sql`
4. [ ] Ejecuta el script (F5)
5. [ ] Verifica que se crearon **15 tablas**

```sql
-- Ejecuta esto para verificar:
USE clinica_equilibrar_erp;
SHOW TABLES;  -- Deberías ver 15 tablas
```

---

## ☑️ PASO 2: Crear Usuario Admin

En dbForge, ejecuta:

```sql
USE clinica_equilibrar_erp;

INSERT INTO usuarios (email, password_hash, id_rol) VALUES 
('admin@equilibrar.com', '$2b$10$rGPxPBXQF5Bl0K.d9.TJj.QK5YPj5JkYvV4iX.J1hV7yhLXP7dQOe', 1);
```

¿Funciona el INSERT? **SÍ** ✅ / **NO** ❌

---

## ☑️ PASO 3: Configurar Backend

Edita: `backend/.env`

Cambia esta línea:
```
DB_PASSWORD=TU_PASSWORD_MYSQL_AQUI
```

Pon la misma password que usas en dbForge.

---

## ☑️ PASO 4: Iniciar Backend

```powershell
./start-backend.ps1
```

¿Ves este mensaje?
```
✓ Conexión a MySQL establecida exitosamente
🚀 Servidor iniciado en puerto 8080
```

**SÍ** ✅ / **NO** ❌

---

## ☑️ PASO 5: Prueba el Backend

Abre: http://localhost:8080/health

¿Responde con JSON? **SÍ** ✅ / **NO** ❌

---

## ☑️ PASO 6: Cambiar Frontend a MySQL

```powershell
./switch-to-mysql.ps1
```

---

## ☑️ PASO 7: Reiniciar Frontend

1. [ ] Ve a la terminal del frontend
2. [ ] Presiona `Ctrl+C`
3. [ ] Ejecuta: `npm run dev`

---

## ☑️ PASO 8: Probar Login

1. [ ] Abre: http://localhost:3000
2. [ ] Login:
   - Email: `admin@equilibrar.com`
   - Password: `admin123`

¿Entraste al dashboard? **SÍ** ✅ / **NO** ❌

---

## ✅ ¡LISTO!

Si todos los checkboxes tienen ✅, ¡tu sistema está funcionando con MySQL!

---

## 🆘 Si algo falló:

**Error en Paso 4 (Backend no conecta):**
- Verifica password en `backend/.env`
- Verifica que MySQL esté corriendo en dbForge

**Error en Paso 8 (Login falla):**
- Abre consola del navegador (F12)
- ¿Qué error aparece?
- Verifica que el backend esté corriendo

**Otros errores:**
- Lee: `SETUP_DBFORGE.md` (guía completa)
- O cuéntame qué paso falló y te ayudo
