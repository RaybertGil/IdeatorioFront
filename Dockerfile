# Etapa de construcción
FROM node:16-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios para la instalación
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código al contenedor
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine

# Copiar la construcción de la etapa anterior al contenedor nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar archivo de configuración de nginx personalizado si es necesario
# Puedes descomentar esto si tienes un archivo nginx.conf
 COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto para el contenedor
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
