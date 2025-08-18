# Simple single-stage Dockerfile for Render deployment
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    libffi-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libfontconfig1 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Create python3 symlink
RUN ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Copy Python requirements and install first
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend package.json and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy frontend package.json and install ALL dependencies (including dev for build)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build frontend (this needs devDependencies which we installed above)
RUN cd frontend && npm run build

# Download spaCy and NLTK data (optional)
RUN python3 -m spacy download en_core_web_sm || echo "spaCy model download failed, continuing..."
RUN python3 -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True)" || echo "NLTK download failed, continuing..."

# Create necessary directories
RUN mkdir -p html_templates output uploads logs

# Make scripts executable
RUN chmod +x start.sh build.sh

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:10000/api/health || exit 1

CMD ["./start.sh"]
