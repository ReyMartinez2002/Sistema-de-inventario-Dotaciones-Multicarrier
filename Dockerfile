# Etapa 1: Build con Node.js 22
FROM node:22.17.1 AS builder

# Crear directorio de la app
WORKDIR /app

# Copiar dependencias y archivos necesarios
COPY package*.json ./
COPY vite.config.* ./
COPY . .

# Instalar dependencias y construir
RUN npm install && npm run build

# Etapa 2: Servir archivos con Nginx
FROM nginx:alpine

# Copiar los archivos estáticos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
