# ATS Backend Integration

This document explains how to use the integrated ATS (Applicant Tracking System) Resume Analyzer with your frontend.

## Features

- **Advanced Resume Analysis**: Uses NLP and machine learning to analyze resumes
- **ATS Compatibility Scoring**: Checks formatting, keywords, and structure
- **Job Description Matching**: Compares resume against job requirements
- **Detailed Feedback**: Provides actionable insights for improvement
- **Multiple File Formats**: Supports PDF and DOCX files
- **Real-time Analysis**: Fast processing with comprehensive results

## Getting Started

### 1. Start the ATS Backend

You can start the ATS backend in several ways:

#### Option A: Using VS Code Tasks
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select "Start ATS Backend"

#### Option B: Using the Shell Script
```bash
cd atsfinale
./start_ats.sh
```

#### Option C: Manual Start
```bash
cd atsfinale
pip3 install fastapi uvicorn python-docx PyPDF2 spacy nltk scikit-learn numpy
python3 -m spacy download en_core_web_sm
python3 ats.py
```

### 2. Start the Frontend

```bash
cd frontend
npm start
```

### 3. Access the ATS Analyzer

- Navigate to `/ats` in your application
- Upload a resume (PDF or DOCX, max 10MB)
- Paste a job description
- Click "Analyze Resume"
- View detailed results on the results page

## API Endpoints

The ATS backend provides the following endpoints:

- `GET /` - API information and health
- `POST /analyze` - Analyze uploaded resume file
- `POST /analyze-text` - Analyze text input
- `GET /health` - Health check
- `GET /models` - Available AI models
- `POST /batch-analyze` - Analyze multiple resumes
- `POST /compare` - Compare two resumes
- `GET /keywords/{industry}` - Get industry keywords
- `GET /analytics` - System analytics

## Configuration

The frontend is configured to connect to the ATS backend at `http://localhost:8001`. 

You can modify the endpoints in `frontend/src/config/index.js`:

```javascript
ats: {
    analyze: {
        url: "http://localhost:8001/analyze",
        method: "POST"
    },
    // ... other endpoints
}
```

## Analysis Results

The ATS analyzer provides:

1. **Overall Score** (0-100): Combined compatibility rating
2. **Detailed Scores**:
   - ATS Compatibility
   - Keyword Optimization  
   - Content Quality
   - Grammar & Spelling
   - Structure & Completeness
3. **Feedback**: Category-specific improvement suggestions
4. **Metrics**: Word count, readability, job similarity
5. **Recommendations**: Actionable tips for optimization

## File Support

- **PDF**: Recommended format for best parsing
- **DOCX**: Microsoft Word documents
- **File Size**: Maximum 10MB per file
- **Languages**: English (primary support)

## Troubleshooting

### Backend Won't Start
1. Ensure Python 3.7+ is installed
2. Install required packages: `pip3 install -r requirements.txt`
3. Download spaCy model: `python3 -m spacy download en_core_web_sm`

### Analysis Fails
1. Check file format (PDF/DOCX only)
2. Verify file size (< 10MB)
3. Ensure job description is provided
4. Check backend logs for detailed errors

### Frontend Connection Issues
1. Verify ATS backend is running on port 8001
2. Check CORS settings in backend
3. Ensure frontend is properly configured

## Advanced Features

- **LLM Integration**: Supports Ollama models for enhanced analysis
- **Batch Processing**: Analyze multiple resumes simultaneously
- **Resume Comparison**: Side-by-side resume analysis
- **Industry Keywords**: Get suggestions for specific industries
- **Export Results**: Download analysis reports as JSON

## Development

To modify the ATS analyzer:

1. Edit `atsfinale/ats.py` for backend changes
2. Update `frontend/src/pages/ats/` for frontend modifications
3. Restart both services after changes

## Dependencies

### Backend
- FastAPI
- Uvicorn
- python-docx
- PyPDF2
- spaCy
- NLTK
- scikit-learn
- numpy

### Frontend
- React
- React Router
- Lucide React (icons)
- Tailwind CSS (styling)
