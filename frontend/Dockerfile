# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json (if you have one)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the build stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (optional, but good practice for SPAs)
# If you have a custom nginx.conf, place it in frontend/nginx.conf
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Command to run Nginx (default command is sufficient)
CMD ["nginx", "-g", "daemon off;"]

# frontend/.env.example
# This file is for environment variables specific to the frontend.
# It will be used by Vite during development and build.

# Base URL for the backend API.
# During development, this will typically point to your backend service's exposed port.
# If running backend locally: http://localhost:8000/api/v1
# If running backend on a GCP VM: http://YOUR_VM_EXTERNAL_IP:8000/api/v1
# VITE_API_BASE_URL=http://localhost:8000/api/v1
