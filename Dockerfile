FROM node:12.16.3-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build && rm -rf node_modules

# production environment
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
