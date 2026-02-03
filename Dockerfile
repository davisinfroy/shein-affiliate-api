# Imagen base con Node.js 20 y soporte para Playwright
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# Configurar entorno de producción
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
