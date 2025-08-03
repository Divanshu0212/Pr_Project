#!/bin/bash

# ATS Backend Startup Script
echo "🚀 Starting ATS Resume Analyzer Backend..."

# Check if we're in the right directory
if [ ! -f "ats.py" ]; then
    echo "❌ Error: ats.py not found. Please run this script from the atsfinale directory."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH."
    exit 1
fi

# Install required packages
echo "📦 Installing required Python packages..."
pip3 install fastapi uvicorn python-docx PyPDF2 spacy nltk scikit-learn numpy

# Download spaCy model
echo "🧠 Downloading spaCy English model..."
python3 -m spacy download en_core_web_sm

# Start the FastAPI server
echo "🌐 Starting FastAPI server on port 8001..."
python3 ats.py
