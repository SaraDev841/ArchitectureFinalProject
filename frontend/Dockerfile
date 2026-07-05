FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@11.6.0 --silent && npm ci --silent
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine AS final
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
