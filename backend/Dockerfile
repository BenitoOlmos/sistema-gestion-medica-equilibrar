# =====================================================
# DOCKERFILE PARA GOOGLE CLOUD RUN
# =====================================================

FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY src ./src

# Exponer puerto (Cloud Run usa PORT env var)
EXPOSE 8080

# Usuario no-root para seguridad
USER node

# Comando de inicio
CMD ["node", "src/server.js"]
