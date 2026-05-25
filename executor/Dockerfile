FROM node:18-slim AS dependencies

WORKDIR /app

# Copy package files first (caching!)
COPY package*.json ./
RUN npm install --only=production

FROM node:18-slim AS runner

WORKDIR /app

# Copy dependencies from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Run as root to access Docker socket
# In production, you'd add the user to docker group instead

EXPOSE 3000

CMD ["node", "server.js"]