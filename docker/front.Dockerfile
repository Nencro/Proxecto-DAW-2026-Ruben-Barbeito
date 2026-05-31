FROM node:20-alpine AS build

WORKDIR /workspace/src/front

COPY src/front/package*.json ./
RUN npm ci

COPY src/front ./
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/front-entrypoint.sh /docker-entrypoint.d/99-exploramas-env.sh
COPY --from=build /workspace/src/front/dist/browser /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/99-exploramas-env.sh

EXPOSE 80
