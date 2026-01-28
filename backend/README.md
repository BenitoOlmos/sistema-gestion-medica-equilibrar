# 🚀 Backend API - Clínica Equilibrar

Backend REST API para el Sistema de Gestión Médica, reemplazando Google Sheets con MySQL.

## 📋 Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** MySQL 8.0+
- **Autenticación:** JWT (JSON Web Tokens)
- **Deploy:** Google Cloud Run + Cloud SQL

## 🏗️ Arquitectura

```
Frontend (Next.js) → Backend API (Express) → MySQL (Cloud SQL)
```

## 📦 Instalación Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 3. Crear base de datos
mysql -u root -p < ../migration/01_create_schema.sql

# 4. Iniciar servidor desarrollo
npm run dev
```

El servidor estará en: `http://localhost:8080`

## 🔐 Autenticación

La API usa JWT para autenticación. Primero debes hacer login:

```bash
POST /api/auth/login
{
  "email": "admin@clinic.com",
  "password": "tu_password"
}
```

Respuesta:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@clinic.com",
      "role": "ADMINISTRADOR"
    }
  }
}
```

Usa el token en las siguientes peticiones:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📚 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (admin)

### Citas
- `GET /api/citas` - Listar citas (con filtros)
- `GET /api/citas/:id` - Obtener cita
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Eliminar cita

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `GET /api/pacientes/:id` - Obtener paciente
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente

### Profesionales
- `GET /api/profesionales` - Listar profesionales

### Servicios
- `GET /api/servicios` - Listar servicios

### Reportes
- `GET /api/reportes/ingresos-mensuales` - Ingresos por mes

## 🧪 Probar la API

### Health Check
```bash
curl http://localhost:8080/health
```

###Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"password123"}'
```

### Obtener Citas
```bash
curl http://localhost:8080/api/citas \
  -H "Authorization: Bearer TU_TOKEN"
```

## 🐳 Deploy a Google Cloud

Ver guía completa: [DEPLOY_GOOGLE_CLOUD.md](./DEPLOY_GOOGLE_CLOUD.md)

Resumen rápido:

```bash
# Deploy a Cloud Run
gcloud run deploy equilibrar-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración MySQL
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── routes/
│   │   ├── auth.routes.js       # Autenticación
│   │   ├── citas.routes.js      # Citas
│   │   ├── pacientes.routes.js  # Pacientes
│   │   ├── profesionales.routes.js
│   │   ├── servicios.routes.js
│   │   └── reportes.routes.js
│   └── server.js                 # Servidor principal
├── .env.example                  # Template variables
├── Dockerfile                    # Docker para Cloud Run
├── package.json
└── README.md
```

## 🔒 Seguridad

- ✅ Helmet para headers seguridad
- ✅ CORS configurado
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Passwords hasheados con bcrypt
- ✅ JWT con expiración
- ✅ Validación de inputs
- ✅ SQL injection prevention (prepared statements)

## 🚦 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno | `production` |
| `PORT` | Puerto servidor | `8080` |
| `DB_HOST` | Host MySQL | `localhost` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | `password` |
| `DB_NAME` | Nombre BD | `clinica_equilibrar_erp` |
| `JWT_SECRET` | Secret para JWT | `string_aleatorio_largo` |
| `FRONTEND_URL` | URL frontend (CORS) | `https://tu-dominio.com` |

## 📊 Logs

```bash
# Desarrollo
npm run dev

# Producción (Cloud Run)
gcloud run services logs tail equilibrar-api --region us-central1
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Con coverage
npm run test:coverage
```

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Haz commit: `git commit -m 'feat: nueva funcionalidad'`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crea Pull Request

## 📝 Licencia

MIT

## 🆘 Soporte

- Documentación completa: `DEPLOY_GOOGLE_CLOUD.md`
- Issues: GitHub Issues

---

**Hecho con ❤️ para Clínica Equilibrar**
