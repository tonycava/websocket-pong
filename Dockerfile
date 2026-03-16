# Stage 1: Build the application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production-stage

# Copy the static files from the build-stage to Nginx's default public folder
# Note: Vite outputs to 'dist' by default
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy your custom nginx config if you have one
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]