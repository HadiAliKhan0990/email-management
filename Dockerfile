FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
