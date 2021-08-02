FROM node:16-alpine as frontend
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM alpine

RUN apk update && apk add tzdata nginx-mod-http-fancyindex

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-theme /nginx-theme
COPY --from=frontend /app/dist/spa /usr/share/nginx/html

EXPOSE 80
VOLUME ["/builds"]
ENTRYPOINT ["nginx", "-g", "daemon off;"]