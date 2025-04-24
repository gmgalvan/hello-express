# Use official Node.js runtime as a base image
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port and define startup command
EXPOSE 8080
CMD ["node", "index.js"]
