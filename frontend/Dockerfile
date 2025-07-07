# Étape 1 : Build de l'application React
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# ✅ Ajoute ceci pour utiliser la bonne URL API pendant le build
COPY .env.production .env

RUN npm run build

# Étape 2 : Serveur NGINX pour la production
FROM nginx:alpine

# Copie la configuration personnalisée de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les fichiers React buildés
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
