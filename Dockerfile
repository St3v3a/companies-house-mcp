FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need devDependencies for building)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Expose the port
ENV PORT=3000
EXPOSE 3000

# Run the HTTP server
CMD ["node", "dist/http-server.js"]
