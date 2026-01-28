# 🚀 GUÍA DE INSTALACIÓN LOCAL - TESTING

## PASO 1: Instalar MySQL en Windows

### Opción A: MySQL Installer (Recomendado)

1. **Descargar MySQL:**
   - Ve a: https://dev.mysql.com/downloads/installer/
   - Descarga: `mysql-installer-community-8.0.XX.msi`

2. **Ejecutar instalador:**
   - Selecciona: "Developer Default"
   - Next → Next → Execute (descargará componentes)

3. **Configurar MySQL Server:**
   - Type and Networking: **Config Type = Development**
   - Port: **3306** (default)
   - Root Password: **Anótalo bien!** (ejemplo: `admin1234`)
   - Create MySQL User: **Opcional**
   - Windows Service: ✅ Start at System Startup

4. **Verificar instalación:**
   ```powershell
   mysql --version
   ```

### Opción B: XAMPP (Más simple, pero menos profesional)

1. Descargar: https://www.apachefriends.org/
2. Instalar XAMPP
3. Abrir XAMPP Control Panel
4. Start → MySQL

---

## PASO 2: Crear Base de Datos

### Conectar a MySQL

```powershell
# Con MySQL Installer
mysql -u root -p
# Ingresa tu password

# Con XAMPP
cd C:\xampp\mysql\bin
.\mysql -u root
```

### Ejecutar Schema

```sql
-- Desde MySQL CLI
SOURCE C:/Users/benit/OneDrive/Escritorio/PROYECTOS/Calendario/migration/01_create_schema.sql
```

O desde PowerShell:
```powershell
mysql -u root -p < migration/01_create_schema.sql
```

---

## PASO 3: Configurar Backend

```powershell
# 1. Ir al directorio backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear .env
cp .env.example .env
```

### Editar .env:
```env
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=clinica_equilibrar_erp
JWT_SECRET=desarrollo_local_secreto_temporal_12345
FRONTEND_URL=http://localhost:3001
```

---

## PASO 4: Iniciar Backend

```powershell
# Desde backend/
npm run dev
```

Deberías ver:
```
✓ Conexión a MySQL establecida exitosamente
=====================================================
🚀 Servidor iniciado en puerto 8080
📍 Entorno: development
🔗 URL: http://localhost:8080
🏥 API Health: http://localhost:8080/health
=====================================================
```

---

## PASO 5: Probar API

### Health Check
```powershell
curl http://localhost:8080/health
```

### Crear usuario de prueba (temporalmente sin hash)

```sql
-- En MySQL CLI
USE clinica_equilibrar_erp;

-- Insertar usuario admin de prueba
INSERT INTO usuarios (email, password_hash, id_rol) VALUES 
('admin@test.com', '$2b$10$rGPxPBXQF5Bl0K.d9.TJj.QK5YPj5JkYvV4iX.J1hV7yhLXP7dQOe', 1);
-- Password: admin123
```

### Login
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\"}'
```

---

## PASO 6: Configurar Frontend

```powershell
# Crear .env.local en la raíz del proyecto
```

### Contenido de .env.local:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Reiniciar frontend:
```powershell
npm run dev
```

---

## PASO 7: Probar el Sistema Completo

1. **Frontend:** http://localhost:3001
2. **Backend:** http://localhost:8080
3. **Login:** admin@test.com / admin123

---

## ⚠️ Troubleshooting

### Error: "Can't connect to MySQL"
- Verifica que MySQL esté corriendo:
  ```powershell
  Get-Service MySQL80  # o MySQL
  ```
- Si está detenido:
  ```powershell
  Start-Service MySQL80
  ```

### Error: "Access denied for user 'root'"
- Verifica password en backend/.env
- Resetea password de root si es necesario

### Error: "Port 8080 already in use"
- Cambia PORT en backend/.env a 8081 u otro

### Frontend no conecta con Backend
- Verifica NEXT_PUBLIC_API_URL en .env.local
- Verifica CORS en backend/src/server.js

---

## 📊 Verificar que todo funciona

```sql
-- En MySQL CLI
USE clinica_equilibrar_erp;

-- Ver tablas creadas
SHOW TABLES;

-- Ver usuarios
SELECT * FROM usuarios;

-- Ver roles
SELECT * FROM roles;
```

---

**¿Todo listo?** Ahora puedes empezar a probar y mejorar el ERP! 🎉
