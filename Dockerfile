# Stage 1: Build the React application
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the application with Node.js Express
FROM node:20-alpine

WORKDIR /app

# We only need the built files and a basic server setup
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install express and http-proxy-middleware for serving and routing APIs
RUN npm install express http-proxy-middleware cors

# Create a simple server script inline
RUN echo "const express = require('express'); \
const path = require('path'); \
const { createProxyMiddleware } = require('http-proxy-middleware'); \
const app = express(); \
const EVOLUTION_URL = process.env.VITE_EVOLUTION_SERVER_URL || process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080'; \
const API_KEY = process.env.VITE_EVOLUTION_API_KEY || process.env.EVOLUTION_API_KEY || ''; \
\
app.use('/evolution', createProxyMiddleware({ \
  target: EVOLUTION_URL, \
  changeOrigin: true, \
  pathRewrite: { '^/evolution': '' }, \
  onProxyReq: (proxyReq, req, res) => { \
      proxyReq.setHeader('Origin', EVOLUTION_URL); \
      if (API_KEY) { \
        proxyReq.setHeader('apikey', API_KEY); \
      } \
  } \
})); \
\
app.use(express.static(path.join(__dirname, 'dist'))); \
\
app.use((req, res) => { \
  res.sendFile(path.join(__dirname, 'dist', 'index.html')); \
}); \
\
const PORT = process.env.PORT || 80; \
app.listen(PORT, () => { \
  console.log('Server is running on port ' + PORT); \
  console.log('Proxying /evolution to ' + EVOLUTION_URL); \
});" > server.cjs

EXPOSE 80

CMD ["node", "server.cjs"]
