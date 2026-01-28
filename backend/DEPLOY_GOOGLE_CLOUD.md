# 🚀 DEPLOY A GOOGLE CLOUD

Guía completa para deployar el backend en Google Cloud.

## 📋 Pre-requisitos

1. **Cuenta de Google Cloud** activa
2. **Google Cloud SDK** instalado (gcloud CLI)
3. **Docker** instalado localmente (opcional)
4. **MobaXterm** para acceso SSH

---

## 🗄️ PASO 1: Configurar Cloud SQL (MySQL)

### Crear instancia Cloud SQL

```bash
# Desde Google Cloud Console o CLI
gcloud sql instances create equilibrar-mysql \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=TU_PASSWORD_SEGURO
```

### Crear la base de datos

```bash
gcloud sql databases create clinica_equilibrar_erp \
    --instance=equilibrar-mysql
```

### Ejecutar el schema

```bash
# Conectar vía Cloud SQL Proxy
cloud_sql_proxy -instances=PROYECTO:REGION:equilibrar-mysql=tcp:3306

# En otra terminal
mysql -h 127.0.0.1 -u root -p < ../migration/01_create_schema.sql
```

---

## 🐳 PASO 2: Deploy del Backend a Cloud Run

### Opción A: Deploy directo desde código

```bash
# Desde el directorio backend/
cd backend

# Deploy a Cloud Run (automático)
gcloud run deploy equilibrar-api \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,DB_HOST=/cloudsql/PROYECTO:REGION:equilibrar-mysql,DB_NAME=clinica_equilibrar_erp,DB_USER=root,DB_PASSWORD=TU_PASSWORD,JWT_SECRET=TU_SECRETO_JWT"
```

### Opción B: Deploy con Docker (más control)

```bash
# 1. Build imagen Docker
docker build -t gcr.io/TU_PROYECTO/equilibrar-api:v1 .

# 2. Push a Google Container Registry
docker push gcr.io/TU_PROYECTO/equilibrar-api:v1

# 3. Deploy a Cloud Run
gcloud run deploy equilibrar-api \
    --image gcr.io/TU_PROYECTO/equilibrar-api:v1 \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

---

## 🔗 PASO 3: Conectar Cloud Run con Cloud SQL

```bash
# Obtener connection name
gcloud sql instances describe equilibrar-mysql --format="value(connectionName)"

# Actualizar servicio Cloud Run
gcloud run services update equilibrar-api \
    --add-cloudsql-instances PROYECTO:REGION:equilibrar-mysql \
    --region us-central1
```

---

## 🌐 PASO 4: Configurar Dominio Personalizado

### En Google Cloud Console:
1. Cloud Run → equilibrar-api → MANAGE CUSTOM DOMAINS
2. Agregar tu dominio: `api.tu-dominio.com`
3. Configurar DNS según las instrucciones

### Configurar SSL automático:
```bash
# Cloud Run maneja SSL automáticamente
# Tu API estará en: https://api.tu-dominio.com
```

---

## 🔐 PASO 5: Variables de Entorno

### Configurar secrets en Cloud Run:

```bash
# Crear secreto para JWT
echo -n "tu_secreto_super_largo" | gcloud secrets create jwt-secret --data-file=-

# Crear secreto para DB password
echo -n "tu_password_db" | gcloud secrets create db-password --data-file=-

# Actualizar Cloud Run para usar secretos
gcloud run services update equilibrar-api \
    --update-secrets=JWT_SECRET=jwt-secret:latest,DB_PASSWORD=db-password:latest \
    --region us-central1
```

---

## 📊 PASO 6: Monitoreo y Logs

### Ver logs en tiempo real:

```bash
# Logs de Cloud Run
gcloud run services logs tail equilibrar-api --region us-central1

# Logs de Cloud SQL
gcloud sql operations list --instance=equilibrar-mysql
```

### Dashboard de monitoreo:
- Cloud Console → Cloud Run → equilibrar-api → LOGS/METRICS

---

## 🔧 PASO 7: Deploy del Frontend aNext.js

### Opción A: Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio raíz
vercel --prod
```

### Variables de entorno en Vercel:
```
NEXT_PUBLIC_API_URL=https://equilibrar-api-xxx.run.app
```

### Opción B: Cloud Run

```bash
# Similar al backend
gcloud run deploy equilibrar-frontend \
    --source . \
    --platform managed \
    --region us-central1
```

---

## 🧪 PASO 8: Probar la API

```bash
# Health check
curl https://equilibrar-api-xxx.run.app/health

# Login
curl -X POST https://equilibrar-api-xxx.run.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"tu_password"}'

# Obtener citas (con token)
curl https://equilibrar-api-xxx.run.app/api/citas \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

---

## 💰 Estimado de Costos (Free Tier)

| Servicio | Free Tier | Costo Estimado |
|----------|-----------|----------------|
| Cloud Run | 2M requests/mes | $0 - $5/mes |
| Cloud SQL (f1-micro) | - | $10/mes |
| Cloud Storage | 5GB | $0 |
| **TOTAL** | | ~$10-15/mes |

---

## 🔄 Actualizar la Aplicación

```bash
# 1. Haz cambios en el código
# 2. Deploy nuevamente
gcloud run deploy equilibrar-api --source . --region us-central1

# Cloud Run crea una nueva revisión automáticamente
```

---

## 🆘 Troubleshooting

### Error de conexión a Cloud SQL:
```bash
# Verificar que Cloud SQL Proxy esté configurado
gcloud run services describe equilibrar-api --region us-central1 | grep cloudsql
```

### Error 502 Bad Gateway:
- Verificar que el puerto sea 8080 (Cloud Run requirement)
- Revisar logs: `gcloud run services logs tail equilibrar-api`

### Timeout:
- Aumentar timeout: `--timeout=300`

---

## 📚 Recursos

- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)
- [Next.js on Vercel](https://vercel.com/docs)

---

**Tu API estará en:** `https://equilibrar-api-xxx.run.app`  
**Tu Frontend en:** `https://tu-dominio.vercel.app` o `https://tu-dominio.com`
