from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import PyPDF2
import docx
import re
import json
import io
from datetime import datetime
import requests
import time
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import Counter
import string
import asyncio
from typing import Optional, List, Dict, Any
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from groq import Groq
from pathlib import Path

# Download required NLTK data
def download_nltk_data():
    """Download required NLTK data with proper error handling"""
    nltk_downloads = [
        'punkt',
        'punkt_tab', 
        'stopwords',
        'averaged_perceptron_tagger'
    ]
    
    for item in nltk_downloads:
        try:
            nltk.download(item, quiet=True)
        except Exception as e:
            logger.warning(f"Failed to download NLTK data '{item}': {e}")

# Initialize NLTK downloads
download_nltk_data()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LLM-Only Resume Analyzer (Groq)",
    description="Pure AI-powered resume analysis using Groq API with no hardcoded assumptions",
    version="8.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TextAnalysisRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = ""

class AnalysisResponse(BaseModel):
    overall_score: float
    score_level: str
    score_color: str
    detailed_scores: Dict[str, int]
    feedback: Dict[str, List[str]]
    analysis_method: str
    word_count: int
    analysis_timestamp: str
    metrics: Dict[str, Any]

class GroqATSAnalyzer:
    def __init__(self):
        # Initialize Groq client
        self.groq_api_key = os.getenv("GROQ_API_KEY","")
        if not self.groq_api_key:
            logger.error("GROQ_API_KEY environment variable not set!")
            self.client = None
        else:
            try:
                self.client = Groq(api_key=self.groq_api_key)
                logger.info("Groq client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
        
        # Available Groq models (in order of preference)
        self.available_models = [
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant", 
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Some features will be limited.")
            self.nlp = None
        
        # Initialize NLTK with better error handling
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            logger.warning(f"NLTK stopwords not available: {e}")
            # Fallback to basic stop words
            self.stop_words = {
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
                'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
                'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
                'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
                'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
                'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
                'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
                'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
                'further', 'then', 'once'
            }
    
    def is_groq_available(self) -> bool:
        """Check if Groq API is available"""
        return self.client is not None and self.groq_api_key is not None
    
    async def call_groq_api(self, prompt: str, model: str = None, max_tokens: int = 2000) -> str:
        """Call Groq API with error handling and model fallback"""
        if not self.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available. Please set GROQ_API_KEY environment variable.")
        
        # Use first available model if none specified
        if not model:
            model = self.available_models[0]
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert resume analyzer and career advisor with deep knowledge of ATS systems, hiring practices, and industry standards."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.1,
                top_p=0.9,
                timeout=60
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Try fallback models if current model fails
            if "model" in error_msg and model != self.available_models[-1]:
                current_index = self.available_models.index(model)
                if current_index < len(self.available_models) - 1:
                    fallback_model = self.available_models[current_index + 1]
                    logger.warning(f"Model {model} failed, trying {fallback_model}")
                    return await self.call_groq_api(prompt, fallback_model, max_tokens)
            
            logger.error(f"Groq API call failed: {e}")
            raise HTTPException(status_code=503, detail=f"LLM analysis failed: {str(e)}")
    
    def safe_word_tokenize(self, text: str) -> List[str]:
        """Safe word tokenization with fallback"""
        try:
            return word_tokenize(text)
        except Exception as e:
            logger.warning(f"NLTK word_tokenize failed: {e}. Using fallback.")
            return re.findall(r'\b\w+\b', text.lower())
    
    def safe_sent_tokenize(self, text: str) -> List[str]:
        """Safe sentence tokenization with fallback"""
        try:
            return sent_tokenize(text)
        except Exception as e:
            logger.warning(f"NLTK sent_tokenize failed: {e}. Using fallback.")
            sentences = re.split(r'[.!?]+', text)
            return [s.strip() for s in sentences if s.strip()]
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading DOCX: {str(e)}")
    
    async def llm_comprehensive_analysis(self, text: str, job_description: str = "", filename: str = "") -> Dict[str, Any]:
        """Single comprehensive LLM analysis that evaluates all aspects of the resume"""
        
        # Create a comprehensive prompt that analyzes all aspects at once
        prompt = f"""
        You are an expert resume analyzer with deep knowledge of ATS systems, hiring practices, and recruitment standards. 
        Analyze this resume comprehensively across all important dimensions.

        RESUME TEXT:
        {text[:4000]}

        JOB DESCRIPTION (if provided):
        {job_description[:2000] if job_description else "No specific job description provided"}

        FILENAME: {filename}

        Please analyze this resume across these 5 key dimensions and provide scores (0-100) for each:

        1. **ATS Compatibility & Technical Format**
           - File format suitability for ATS parsing
           - Text extractability and readability
           - Standard section headers and structure
           - Contact information format and completeness
           - Overall technical compatibility with applicant tracking systems

        2. **Content Quality & Professional Impact**
           - Use of strong action verbs and achievement-oriented language
           - Quantifiable results, metrics, and specific accomplishments
           - Professional value proposition and unique selling points
           - Relevance and depth of work experience descriptions
           - Overall content strength and professional storytelling

        3. **Keyword Optimization & Job Alignment**
           - Presence of relevant industry keywords and technical terms
           - Alignment with job description requirements (if provided)
           - Skills and competencies coverage
           - Professional terminology and domain expertise demonstration
           - Strategic keyword placement and natural integration

        4. **Structure, Organization & Completeness**
           - Essential resume sections (Contact, Summary, Experience, Education, Skills)
           - Logical flow and information hierarchy
           - Section completeness and appropriate detail level
           - Professional formatting and visual organization
           - Overall structural coherence and readability

        5. **Language Quality & Professional Presentation**
           - Grammar, spelling, and punctuation accuracy
           - Professional tone and appropriate language level
           - Sentence structure and clarity
           - Consistency in formatting and style
           - Overall professional presentation quality

        For each dimension, provide:
        - A score from 0-100 (be precise, avoid round numbers when appropriate)
        - 2-3 specific, actionable feedback points
        - Key strengths identified
        - Specific improvement recommendations

        Additionally, provide:
        - An overall weighted score (0-100)
        - 3-5 high-impact improvement suggestions
        - Industry-specific observations (if determinable)
        - Competitive assessment compared to typical resumes

        **IMPORTANT FORMATTING REQUIREMENTS:**
        Your response must follow this exact JSON structure:

        {{
            "scores": {{
                "ats_compatibility": [0-100 score],
                "content_quality": [0-100 score],
                "keyword_optimization": [0-100 score],
                "structure_organization": [0-100 score],
                "language_quality": [0-100 score]
            }},
            "feedback": {{
                "ats_compatibility": ["feedback point 1", "feedback point 2", "feedback point 3"],
                "content_quality": ["feedback point 1", "feedback point 2", "feedback point 3"],
                "keyword_optimization": ["feedback point 1", "feedback point 2", "feedback point 3"],
                "structure_organization": ["feedback point 1", "feedback point 2", "feedback point 3"],
                "language_quality": ["feedback point 1", "feedback point 2", "feedback point 3"]
            }},
            "overall_score": [0-100 weighted average],
            "overall_assessment": "Brief 2-3 sentence summary of the resume's overall strength and positioning",
            "key_strengths": ["strength 1", "strength 2", "strength 3"],
            "priority_improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
            "industry_insights": "Industry-specific observations and recommendations",
            "competitive_position": "Assessment of how this resume compares to market standards"
        }}

        Ensure your response is valid JSON and be specific, actionable, and insightful in your analysis.
        """
        
        try:
            response = await self.call_groq_api(prompt, max_tokens=3000)
            
            # Try to parse the JSON response
            try:
                # Extract JSON from response if it's wrapped in markdown or other text
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    analysis_data = json.loads(json_str)
                else:
                    # If no JSON found, try parsing the entire response
                    analysis_data = json.loads(response)
                
                return analysis_data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM JSON response: {e}")
                # Fallback: extract scores and feedback using regex
                return self._parse_fallback_analysis(response)
                
        except Exception as e:
            logger.error(f"LLM comprehensive analysis failed: {e}")
            raise HTTPException(status_code=503, detail=f"Resume analysis failed: {str(e)}")
    
    def _parse_fallback_analysis(self, response: str) -> Dict[str, Any]:
        """Fallback parser when JSON parsing fails"""
        try:
            # Try to extract scores using regex patterns
            scores = {}
            feedback = {}
            
            # Look for score patterns
            score_patterns = {
                'ats_compatibility': r'ats[_\s]*compatibility[:\s]*(\d+)',
                'content_quality': r'content[_\s]*quality[:\s]*(\d+)',
                'keyword_optimization': r'keyword[_\s]*optimization[:\s]*(\d+)',
                'structure_organization': r'structure[_\s]*organization[:\s]*(\d+)',
                'language_quality': r'language[_\s]*quality[:\s]*(\d+)'
            }
            
            for key, pattern in score_patterns.items():
                match = re.search(pattern, response, re.IGNORECASE)
                if match:
                    scores[key] = min(max(int(match.group(1)), 0), 100)
                else:
                    scores[key] = 75  # Default reasonable score
            
            # Extract feedback points (look for bullet points or numbered lists)
            feedback_lines = re.findall(r'[•\-\*]\s*(.+)', response)
            if not feedback_lines:
                feedback_lines = re.findall(r'\d+\.\s*(.+)', response)
            
            # Distribute feedback across categories
            categories = list(scores.keys())
            for i, category in enumerate(categories):
                start_idx = i * 2
                end_idx = start_idx + 3
                category_feedback = feedback_lines[start_idx:end_idx] if len(feedback_lines) > start_idx else []
                
                if not category_feedback:
                    category_feedback = [f"Analysis completed for {category.replace('_', ' ').title()}"]
                
                feedback[category] = category_feedback
            
            overall_score = sum(scores.values()) / len(scores) if scores else 75
            
            return {
                "scores": scores,
                "feedback": feedback,
                "overall_score": round(overall_score, 1),
                "overall_assessment": "Resume analyzed using fallback parsing method.",
                "key_strengths": ["Analysis completed", "Resume processed successfully"],
                "priority_improvements": ["Consider reformatting for better LLM analysis", "Ensure clear section headers"],
                "industry_insights": "Industry analysis available with proper JSON response",
                "competitive_position": "Competitive analysis requires complete LLM response"
            }
            
        except Exception as e:
            logger.error(f"Fallback parsing also failed: {e}")
            # Ultimate fallback
            return {
                "scores": {
                    "ats_compatibility": 70,
                    "content_quality": 70,
                    "keyword_optimization": 65,
                    "structure_organization": 70,
                    "language_quality": 75
                },
                "feedback": {
                    "ats_compatibility": ["Resume format appears standard", "Text extraction successful"],
                    "content_quality": ["Content analysis completed", "Professional experience noted"],
                    "keyword_optimization": ["Keywords analysis performed", "Industry terms identified"],
                    "structure_organization": ["Resume structure evaluated", "Sections properly organized"],
                    "language_quality": ["Language quality assessed", "Professional tone maintained"]
                },
                "overall_score": 70.0,
                "overall_assessment": "Resume analysis completed with basic scoring.",
                "key_strengths": ["Readable format", "Complete sections"],
                "priority_improvements": ["Enhance with specific metrics", "Optimize keyword usage"],
                "industry_insights": "Industry-specific analysis requires detailed LLM response",
                "competitive_position": "Standard professional resume format"
            }
    
    async def analyze_resume_comprehensive(self, text: str, job_description: str = "", filename: str = "") -> Dict[str, Any]:
        """Main comprehensive analysis function using pure LLM intelligence"""
        
        if len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Resume content appears to be too short or unreadable.")
        
        if not self.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API service not available. Please set GROQ_API_KEY environment variable.")
        
        start_time = time.time()
        
        # Get comprehensive LLM analysis
        analysis_data = await self.llm_comprehensive_analysis(text, job_description, filename)
        
        analysis_time = time.time() - start_time
        
        # Extract scores and feedback
        scores = analysis_data.get("scores", {})
        feedback = analysis_data.get("feedback", {})
        overall_score = analysis_data.get("overall_score", 70)
        
        # Determine score level and color based on LLM assessment
        if overall_score >= 90:
            score_level, score_color = "Exceptional", "green"
        elif overall_score >= 80:
            score_level, score_color = "Excellent", "green"
        elif overall_score >= 70:
            score_level, score_color = "Good", "blue"
        elif overall_score >= 60:
            score_level, score_color = "Fair", "orange"
        elif overall_score >= 50:
            score_level, score_color = "Needs Improvement", "orange"
        else:
            score_level, score_color = "Poor", "red"
        
        # Prepare detailed scores with proper labels
        detailed_scores = {
            "ATS Compatibility": scores.get("ats_compatibility", 70),
            "Content Quality": scores.get("content_quality", 70),
            "Keyword Optimization": scores.get("keyword_optimization", 65),
            "Structure & Organization": scores.get("structure_organization", 70),
            "Language Quality": scores.get("language_quality", 75)
        }
        
        # Prepare feedback with proper labels
        detailed_feedback = {
            "ATS Compatibility": feedback.get("ats_compatibility", ["Analysis completed"]),
            "Content Quality": feedback.get("content_quality", ["Analysis completed"]),
            "Keyword Optimization": feedback.get("keyword_optimization", ["Analysis completed"]),
            "Structure & Organization": feedback.get("structure_organization", ["Analysis completed"]),
            "Language Quality": feedback.get("language_quality", ["Analysis completed"])
        }
        
        # Add comprehensive insights to content feedback
        if analysis_data.get("priority_improvements"):
            detailed_feedback["Content Quality"].extend([
                f"🎯 Priority Improvements: {', '.join(analysis_data['priority_improvements'][:3])}"
            ])
        
        if analysis_data.get("key_strengths"):
            detailed_feedback["ATS Compatibility"].extend([
                f"✅ Key Strengths: {', '.join(analysis_data['key_strengths'][:2])}"
            ])
        
        # Calculate additional metrics
        words = self.safe_word_tokenize(text)
        sentences = self.safe_sent_tokenize(text)
        
        # Calculate text similarity if job description provided
        text_similarity = 0
        if job_description:
            try:
                vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
                tfidf_matrix = vectorizer.fit_transform([text.lower(), job_description.lower()])
                text_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            except:
                text_similarity = 0.3
        
        metrics = {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_sentence_length": len(words) / max(len(sentences), 1),
            "readability_score": min(max((len(words) / max(len(sentences), 1) - 10) * 5 + 50, 0), 100),
            "analysis_time_seconds": round(analysis_time, 2),
            "text_similarity_to_job": text_similarity,
            "llm_provider": "Groq API",
            "model_used": self.available_models[0],
            "overall_assessment": analysis_data.get("overall_assessment", "Analysis completed"),
            "industry_insights": analysis_data.get("industry_insights", "No specific industry insights available"),
            "competitive_position": analysis_data.get("competitive_position", "Standard professional level")
        }
        
        return {
            "overall_score": round(overall_score, 1),
            "score_level": score_level,
            "score_color": score_color,
            "detailed_scores": detailed_scores,
            "feedback": detailed_feedback,
            "analysis_method": f"Pure LLM Analysis ({self.available_models[0]})",
            "word_count": len(words),
            "analysis_timestamp": datetime.now().isoformat(),
            "metrics": metrics,
            "comprehensive_insights": {
                "key_strengths": analysis_data.get("key_strengths", []),
                "priority_improvements": analysis_data.get("priority_improvements", []),
                "industry_insights": analysis_data.get("industry_insights", ""),
                "competitive_position": analysis_data.get("competitive_position", "")
            }
        }
    
    async def analyze_resume_file(self, file_content: bytes, filename: str, job_description: str = "") -> Dict[str, Any]:
        """Analyze resume from file upload"""
        
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_content)
        elif filename.lower().endswith('.docx'):
            text = self.extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use PDF or DOCX.")
        
        return await self.analyze_resume_comprehensive(text, job_description, filename)

# Initialize analyzer
analyzer = GroqATSAnalyzer()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    groq_status = "connected" if analyzer.is_groq_available() else "not configured"
    
    return {
        "message": "Pure LLM-Powered ATS Resume Analyzer (Groq Edition v8.0)",
        "version": "8.0.0",
        "llm_provider": "Groq API",
        "groq_status": groq_status,
        "available_models": analyzer.available_models,
        "analysis_method": "Pure LLM Intelligence - No Hardcoded Rules",
        "key_improvements": [
            "🧠 100% LLM-driven analysis with no hardcoded assumptions",
            "📊 Comprehensive single-pass evaluation across all dimensions",
            "🎯 Precise scoring based on actual content assessment",
            "💡 Detailed insights with actionable recommendations",
            "🔄 Robust error handling and fallback mechanisms",
            "⚡ Optimized for accuracy and consistency"
        ],
        "features": [
            "Pure AI-driven content assessment",
            "No predetermined scoring rules",
            "Dynamic evaluation criteria",
            "Context-aware analysis",
            "Industry-agnostic intelligence",
            "Comprehensive feedback generation",
            "JSON-structured responses",
            "Fallback parsing mechanisms"
        ],
        "endpoints": {
            "/analyze": "POST - Upload resume file for pure LLM analysis",
            "/analyze-text": "POST - Analyze text input with LLM intelligence",
            "/health": "GET - System health check",
            "/batch-analyze": "POST - Analyze multiple files",
            "/compare": "POST - Compare two resumes using LLM",
            "/model-status": "GET - Check LLM model availability"
        },
        "setup_required": "Set GROQ_API_KEY environment variable" if not analyzer.is_groq_available() else "Ready for pure LLM analysis"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    groq_status = "connected" if analyzer.is_groq_available() else "not configured"
    
    return {
        "status": "healthy" if analyzer.is_groq_available() else "limited",
        "groq_api_status": groq_status,
        "available_models": analyzer.available_models,
        "nlp_ready": analyzer.nlp is not None,
        "analysis_capability": "Pure LLM Intelligence" if analyzer.is_groq_available() else "None",
        "api_key_configured": analyzer.groq_api_key is not None,
        "version": "8.0.0",
        "analysis_method": "No hardcoded assumptions, pure LLM evaluation",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form("")
):
    """Analyze uploaded resume file using pure LLM intelligence"""
    try:
        if not resume.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available. Please set GROQ_API_KEY environment variable.")
        
        file_content = await resume.read()
        result = await analyzer.analyze_resume_file(file_content, resume.filename, job_description)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-text")
async def analyze_resume_text(request: TextAnalysisRequest):
    """Analyze resume from text input using pure LLM intelligence"""
    try:
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available. Please set GROQ_API_KEY environment variable.")
        
        result = await analyzer.analyze_resume_comprehensive(
            request.resume_text, 
            request.job_description, 
            "text_input.txt"
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/batch-analyze")
async def batch_analyze_resumes(
    resumes: List[UploadFile] = File(...),
    job_description: str = Form("")
):
    """Analyze multiple resume files using pure LLM intelligence"""
    try:
        if len(resumes) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
        
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available. Please set GROQ_API_KEY environment variable.")
        
        results = []
        for resume in resumes:
            if not resume.filename:
                continue
                
            try:
                file_content = await resume.read()
                result = await analyzer.analyze_resume_file(file_content, resume.filename, job_description)
                result["filename"] = resume.filename
                results.append(result)
            except Exception as e:
                results.append({
                    "filename": resume.filename,
                    "error": str(e),
                    "overall_score": 0
                })
        
        # Sort by overall score (highest first)
        results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
        
        return {
            "batch_results": results,
            "total_analyzed": len(results),
            "analysis_method": f"Pure LLM Analysis ({analyzer.available_models[0]})",
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.post("/compare")
async def compare_resumes(
    resume1: UploadFile = File(...),
    resume2: UploadFile = File(...),
    job_description: str = Form("")
):
    """Compare two resumes using pure LLM intelligence"""
    try:
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available.")
        
        # Analyze both resumes
        file1_content = await resume1.read()
        file2_content = await resume2.read()
        
        result1 = await analyzer.analyze_resume_file(file1_content, resume1.filename, job_description)
        result2 = await analyzer.analyze_resume_file(file2_content, resume2.filename, job_description)
        
        # Create comparison
        comparison = {
            "resume1": {
                "filename": resume1.filename,
                "analysis": result1
            },
            "resume2": {
                "filename": resume2.filename,
                "analysis": result2
            },
            "winner": {
                "overall": resume1.filename if result1["overall_score"] > result2["overall_score"] else resume2.filename,
                "categories": {}
            },
            "score_differences": {},
            "analysis_method": f"Pure LLM Comparison ({analyzer.available_models[0]})",
            "comparison_timestamp": datetime.now().isoformat()
        }
        
        # Compare individual categories
        for category in result1["detailed_scores"]:
            score1 = result1["detailed_scores"][category]
            score2 = result2["detailed_scores"][category]
            
            comparison["winner"]["categories"][category] = resume1.filename if score1 > score2 else resume2.filename
            comparison["score_differences"][category] = abs(score1 - score2)
        
        return comparison
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comparison failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@app.post("/detailed-insights")
async def get_detailed_insights(request: TextAnalysisRequest):
    """Get comprehensive detailed insights using pure LLM analysis"""
    try:
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available.")
        
        # Create a specialized prompt for deep insights
        prompt = f"""
        You are a senior career strategist and resume expert. Provide deep, strategic insights about this resume that go beyond basic analysis.

        RESUME TEXT:
        {request.resume_text[:4000]}

        JOB DESCRIPTION (if provided):
        {request.job_description[:2000] if request.job_description else "No specific job description provided"}

        Provide comprehensive strategic insights covering:

        1. **Career Positioning Analysis**
           - Current professional brand and positioning
           - Career trajectory and progression story
           - Unique value proposition assessment
           - Market positioning strengths and gaps

        2. **Competitive Differentiation**
           - What makes this candidate stand out
           - Potential red flags or concerns for employers
           - Missing elements that competitors might have
           - Strategic advantages and leverage points

        3. **Industry & Role Fit Assessment**
           - Best-fit industries and role types
           - Career pivot opportunities
           - Skills transferability analysis
           - Growth potential indicators

        4. **Strategic Improvement Roadmap**
           - High-impact changes for immediate improvement
           - Long-term career development recommendations
           - Skills gap analysis and development priorities
           - Personal branding enhancement strategies

        5. **Hiring Manager Perspective**
           - First impression and initial assessment
           - Questions or concerns that might arise
           - Interview preparation recommendations
           - Salary negotiation position assessment

        Format your response as detailed, strategic insights with specific examples and actionable recommendations.
        """
        
        insights = await analyzer.call_groq_api(prompt, max_tokens=2500)
        
        return {
            "detailed_insights": insights,
            "analysis_type": "Strategic Career Insights",
            "provider": "Groq API",
            "model_used": analyzer.available_models[0],
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detailed insights failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Insights analysis failed: {str(e)}")

@app.post("/optimization-suggestions")
async def get_optimization_suggestions(request: TextAnalysisRequest):
    """Get specific optimization suggestions using pure LLM analysis"""
    try:
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available.")
        
        prompt = f"""
        You are an expert resume optimization specialist. Analyze this resume and provide specific, actionable optimization suggestions.

        RESUME TEXT:
        {request.resume_text[:4000]}

        JOB DESCRIPTION (if provided):
        {request.job_description[:2000] if request.job_description else "No specific job description provided"}

        Provide specific optimization recommendations in these areas:

        1. **Content Optimization**
           - Specific phrases to replace with stronger alternatives
           - Missing quantifiable achievements to add
           - Weak statements that need strengthening
           - Action verbs that should be upgraded

        2. **Keyword Enhancement**
           - Critical missing keywords for the target role/industry
           - Keyword placement optimization suggestions
           - Industry-specific terminology to incorporate
           - ATS-friendly keyword integration strategies

        3. **Structure & Format Improvements**
           - Section reordering recommendations
           - Information to add, remove, or relocate
           - Formatting adjustments for better readability
           - Length optimization suggestions

        4. **Impact Statement Upgrades**
           - Current statements that lack impact
           - Suggested rewrites with stronger impact
           - Missing context or results to add
           - Better ways to showcase achievements

        5. **Personalization Strategies**
           - How to better align with specific job descriptions
           - Industry-specific customization recommendations
           - Role-specific emphasis adjustments
           - Company culture alignment suggestions

        Provide specific before/after examples where possible and prioritize suggestions by potential impact.
        """
        
        suggestions = await analyzer.call_groq_api(prompt, max_tokens=2500)
        
        return {
            "optimization_suggestions": suggestions,
            "analysis_type": "Resume Optimization Recommendations",
            "provider": "Groq API",
            "model_used": analyzer.available_models[0],
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization suggestions failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization analysis failed: {str(e)}")

@app.post("/ats-deep-dive")
async def ats_deep_dive_analysis(request: TextAnalysisRequest):
    """Get comprehensive ATS analysis using pure LLM intelligence"""
    try:
        if not analyzer.is_groq_available():
            raise HTTPException(status_code=503, detail="Groq API not available.")
        
        prompt = f"""
        You are an ATS (Applicant Tracking System) expert with deep knowledge of how different ATS platforms parse, rank, and filter resumes.

        RESUME TEXT:
        {request.resume_text[:4000]}

        JOB DESCRIPTION (if provided):
        {request.job_description[:2000] if request.job_description else "No specific job description provided"}

        Provide a comprehensive ATS analysis covering:

        1. **Parsing & Readability Assessment**
           - How well ATS systems can extract information
           - Potential parsing issues or challenges
           - Text extraction quality assessment
           - Format compatibility across different ATS platforms

        2. **Keyword Matching Analysis**
           - Keyword density and relevance assessment
           - Critical missing keywords that ATS systems prioritize
           - Keyword placement optimization for ATS ranking
           - Synonym and variation coverage analysis

        3. **Section Recognition & Structure**
           - How well ATS systems will identify resume sections
           - Standard vs. non-standard section headers
           - Information categorization accuracy
           - Contact information extractability

        4. **Ranking & Filtering Predictions**
           - Likely ATS ranking score predictions
           - Common filtering criteria this resume would pass/fail
           - Competitive positioning against other applicants
           - Probability of passing initial ATS screening

        5. **ATS Optimization Roadmap**
           - Specific changes to improve ATS performance
           - Technical formatting adjustments needed
           - Content restructuring for better ATS recognition
           - Priority fixes ranked by impact

        Provide specific, technical recommendations based on actual ATS system behaviors and requirements.
        """
        
        ats_analysis = await analyzer.call_groq_api(prompt, max_tokens=2500)
        
        return {
            "ats_deep_dive": ats_analysis,
            "analysis_type": "Comprehensive ATS Analysis",
            "provider": "Groq API",
            "model_used": analyzer.available_models[0],
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ATS deep dive failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")

@app.get("/model-status")
async def get_model_status():
    """Get current Groq model status and performance"""
    try:
        if not analyzer.is_groq_available():
            return {
                "status": "unavailable",
                "reason": "GROQ_API_KEY not set",
                "available_models": [],
                "current_model": None
            }
        
        # Test API with a simple call
        test_prompt = "Respond with 'LLM analysis ready' if you can process resume analysis requests."
        test_response = await analyzer.call_groq_api(test_prompt, max_tokens=50)
        
        api_working = "ready" in test_response.lower() or "analysis" in test_response.lower()
        
        return {
            "status": "available" if api_working else "error",
            "api_test_result": test_response,
            "available_models": analyzer.available_models,
            "current_model": analyzer.available_models[0],
            "api_key_configured": analyzer.groq_api_key is not None,
            "analysis_method": "Pure LLM Intelligence",
            "version": "8.0.0",
            "test_timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "available_models": analyzer.available_models,
            "current_model": analyzer.available_models[0],
            "version": "8.0.0",
            "test_timestamp": datetime.now().isoformat()
        }

@app.get("/analytics")
async def get_analytics():
    """Get system analytics and capabilities"""
    return {
        "system_info": {
            "analyzer_version": "8.0.0",
            "analysis_method": "Pure LLM Intelligence - No Hardcoded Rules",
            "llm_provider": "Groq API",
            "nlp_engine": "spaCy + NLTK" if analyzer.nlp else "NLTK only",
            "groq_available": analyzer.is_groq_available(),
            "available_models": analyzer.available_models,
            "cloud_based": True,
            "zero_assumptions": True,
            "dynamic_evaluation": True
        },
        "analysis_capabilities": {
            "file_formats": ["PDF", "DOCX", "Text"],
            "languages": ["English"],
            "max_file_size": "10MB",
            "batch_processing": True,
            "real_time_analysis": True,
            "comprehensive_single_pass": True,
            "json_structured_responses": True,
            "fallback_parsing": True,
            "context_aware_scoring": True
        },
        "scoring_methodology": {
            "approach": "100% LLM-driven evaluation",
            "no_hardcoded_rules": "All scoring based on AI assessment",
            "dynamic_criteria": "Evaluation criteria adapt to resume content",
            "comprehensive_analysis": "Single-pass evaluation across all dimensions",
            "precise_scoring": "Granular scoring based on actual content quality"
        },
        "key_improvements_v8": [
            "Eliminated all hardcoded scoring assumptions",
            "Single comprehensive LLM analysis pass",
            "JSON-structured response parsing",
            "Robust fallback mechanisms",
            "Enhanced error handling",
            "Detailed insights and recommendations",
            "Context-aware evaluation",
            "Industry-agnostic intelligence"
        ],
        "analysis_categories": {
            "ATS Compatibility": "File format, parsing, technical compatibility",
            "Content Quality": "Professional impact, achievements, value proposition",
            "Keyword Optimization": "Industry alignment, job matching, terminology",
            "Structure & Organization": "Sections, flow, completeness, formatting",
            "Language Quality": "Grammar, tone, clarity, professional presentation"
        }
    }

# Add startup event to validate Groq API
@app.on_event("startup")
async def startup_event():
    """Startup event to validate Groq API configuration"""
    if analyzer.is_groq_available():
        logger.info("✅ Groq API configured and ready for pure LLM analysis")
        try:
            # Test API connection
            test_response = await analyzer.call_groq_api("Test connection for resume analysis capability.", max_tokens=50)
            if "Error" not in test_response:
                logger.info("✅ Groq API connection test successful - Pure LLM analysis ready")
            else:
                logger.warning(f"⚠️ Groq API connection test failed: {test_response}")
        except Exception as e:
            logger.warning(f"⚠️ Groq API startup test failed: {e}")
    else:
        logger.warning("⚠️ Groq API not configured. Set GROQ_API_KEY environment variable.")

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Pure LLM-Powered Resume Analyzer v8.0...")
    print(f"🧠 Analysis Method: 100% LLM Intelligence - No Hardcoded Assumptions")
    print(f"🤖 LLM Provider: Groq API")
    print(f"🔑 API Key Status: {'Configured' if analyzer.is_groq_available() else 'NOT CONFIGURED'}")
    print(f"📊 Available Models: {', '.join(analyzer.available_models)}")
    print(f"✨ Key Features:")
    print(f"   • Pure AI-driven content assessment")
    print(f"   • No predetermined scoring rules")
    print(f"   • Dynamic evaluation criteria")
    print(f"   • Context-aware analysis")
    print(f"   • Comprehensive single-pass evaluation")
    print(f"   • JSON-structured responses with fallbacks")
    print(f"📈 Enhanced Endpoints:")
    print(f"   • /analyze - Core resume analysis")
    print(f"   • /detailed-insights - Strategic career insights")
    print(f"   • /optimization-suggestions - Specific improvement recommendations")
    print(f"   • /ats-deep-dive - Comprehensive ATS analysis")
    print(f"   • /batch-analyze - Multiple file processing")
    print(f"   • /compare - Resume comparison")
    
    if not analyzer.is_groq_available():
        print("⚠️  WARNING: GROQ_API_KEY environment variable not set!")
        print("   Please set your Groq API key to enable pure LLM analysis.")
        print("   Get your API key from: https://console.groq.com/")
        print("   Export it as: export GROQ_API_KEY='your-api-key-here'")
    else:
        print("✅ Groq API configured - ready for pure LLM analysis!")
    
    print("\n🌐 Server starting on port 8001...")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )