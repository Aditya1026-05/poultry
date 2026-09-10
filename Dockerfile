# ==========================================
# Stage 1: Build the React static bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Ensure production builds compile with relative /api endpoints
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies using package-lock.json for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source code and configuration files
COPY tsconfig*.json vite.config.ts postcss.config.js tailwind.config.ts components.json index.html ./
COPY src/ ./src/
COPY public/ ./public/

# Build static production assets into /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve with lightweight Nginx
# ==========================================
FROM nginx:alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom SPA Nginx server block
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard container port
EXPOSE 80

# Start Nginx in the foreground so container stays alive
CMD ["nginx", "-g", "daemon off;"]
