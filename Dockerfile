FROM node:22-slim

WORKDIR /app

# Copy pre-built Smithery bundle
COPY .smithery/index.cjs ./.smithery/index.cjs

# Copy package files for any runtime dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts

# Expose the port Smithery expects
ENV PORT=3000
EXPOSE 3000

# Run the pre-built Smithery bundle
CMD ["node", ".smithery/index.cjs"]
