FROM node:lts-alpine as frontend
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM alpine

RUN apk update && apk add nginx-mod-http-fancyindex

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-theme /nginx-theme
COPY --from=frontend /app/dist /usr/share/nginx/html

EXPOSE 80
VOLUME ["/builds"]
ENTRYPOINT ["nginx", "-g", "daemon off;"]