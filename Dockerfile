# Usamos una imagen oficial de Node
FROM node:20-alpine

# Crear y seleccionar el directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.build.json ./
COPY tsconfig.json ./
COPY .env .env
COPY src ./src

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma usando las variables de entorno reales
RUN npx prisma generate

# Compilar el proyecto NestJS
RUN npm run build

# Puerto expuesto
EXPOSE 3000

# Comando final
CMD ["npm", "run", "start:prod"]