#!/bin/bash

# Build script for Render deployment
set -e

echo "Starting build process..."

# Install system dependencies if needed (this is handled by Dockerfile)
echo "System dependencies will be installed by Dockerfile..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Download NLTK data
echo "Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True)"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm ci --only=production

# Install frontend dependencies and build
echo "Installing frontend dependencies and building..."
cd ../frontend && npm ci && npm run build

# Create necessary directories
echo "Creating necessary directories..."
cd ..
mkdir -p html_templates output uploads logs

echo "Build completed successfully!"
