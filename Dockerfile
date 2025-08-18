# Multi-stage Dockerfile for Full-Stack Application

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Backend Setup
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Stage 3: Python Services Setup
FROM python:3.9-slim AS python-builder

WORKDIR /app

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libfontconfig1 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Stage 4: Final Runtime Image
FROM python:3.9-slim

# Install Node.js and system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libffi-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libfontconfig1 \
    libgtk-3-0 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies from builder stage
COPY --from=python-builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=python-builder /usr/local/bin /usr/local/bin

# Copy backend from builder stage
COPY --from=backend-builder /app/backend ./backend

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy Python files
COPY ats3.py .
COPY temp4.py .
COPY requirements.txt .

# Create necessary directories
RUN mkdir -p html_templates output uploads

# Copy any additional configuration files
COPY backend/config ./backend/config
COPY backend/models ./backend/models
COPY backend/routes ./backend/routes
COPY backend/middleware ./backend/middleware
COPY backend/controller ./backend/controller
COPY backend/db ./backend/db
COPY backend/utils ./backend/utils

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Back to main directory
WORKDIR /app

# Expose ports
EXPOSE 3000 5000 8000 8001

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
echo "Starting all services..."\n\
\n\
# Start backend server in background\n\
cd /app/backend && npm start &\n\
BACKEND_PID=$!\n\
\n\
# Start ATS service in background\n\
cd /app && python3 ats3.py &\n\
ATS_PID=$!\n\
\n\
# Start Resume Generator service in background\n\
cd /app && python3 temp4.py &\n\
RESUME_PID=$!\n\
\n\
# Function to handle shutdown\n\
cleanup() {\n\
    echo "Shutting down services..."\n\
    kill $BACKEND_PID $ATS_PID $RESUME_PID 2>/dev/null || true\n\
    wait\n\
    exit 0\n\
}\n\
\n\
# Set up signal handlers\n\
trap cleanup SIGTERM SIGINT\n\
\n\
# Wait for all background processes\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || curl -f http://localhost:5000/api/health || curl -f http://localhost:8000/api/health || exit 1

# Start all services
CMD ["/app/start.sh"]
