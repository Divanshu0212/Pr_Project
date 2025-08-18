#!/bin/bash

# Build script for Render deployment
set -e

echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install --no-cache-dir -r requirements.txt || {
    echo "Failed to install Python dependencies, trying with pip..."
    pip install --no-cache-dir -r requirements.txt
}

# Download spaCy model (optional)
echo "Downloading spaCy model..."
python3 -m spacy download en_core_web_sm || {
    echo "spaCy model download failed, continuing without it..."
}

# Download NLTK data (optional)
echo "Downloading NLTK data..."
python3 -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)" || {
    echo "NLTK download failed, continuing without it..."
}

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm ci --only=production || {
    echo "Backend npm ci failed, trying npm install..."
    npm install --only=production
}

# Install frontend dependencies and build
echo "Installing frontend dependencies and building..."
cd ../frontend && npm ci || {
    echo "Frontend npm ci failed, trying npm install..."
    npm install
}

# Build frontend
echo "Building frontend..."
npm run build

# Create necessary directories
echo "Creating necessary directories..."
cd ..
mkdir -p html_templates output uploads logs

echo "Build completed successfully!"
