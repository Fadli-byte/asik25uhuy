# Base image dengan Python dan Node.js
FROM python:3.11-slim

# Install system dependencies yang diperlukan OpenCV dan Node.js
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgthread-2.0-0 \
    libstdc++6 \
    libgcc-s1 \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

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

