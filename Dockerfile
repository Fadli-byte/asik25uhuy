# Multi-stage build untuk mengurangi ukuran image
FROM python:3.11-slim as python-base

# Install system dependencies yang diperlukan OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgthread-2.0-0 \
    libstdc++6 \
    libgcc-s1 \
    && rm -rf /var/lib/apt/lists/*

# Stage untuk Node.js
FROM node:18-slim as node-base

# Final stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgthread-2.0-0 \
    libstdc++6 \
    libgcc-s1 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
COPY --from=node-base /usr/local/bin/node /usr/local/bin/
COPY --from=node-base /usr/local/bin/npm /usr/local/bin/
COPY --from=node-base /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js dependencies
RUN npm install

# Create virtual environment and install Python dependencies
RUN python3 -m venv venv
RUN venv/bin/pip install --upgrade pip setuptools wheel
RUN venv/bin/pip install -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "app.js"]

