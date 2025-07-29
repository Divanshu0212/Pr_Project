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
    title="Advanced ATS Resume Analyzer",
    description="AI-powered resume analysis with comprehensive scoring",
    version="5.0.0"
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

class AdvancedATSAnalyzer:
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url
        self.preferred_models = ["qwen2.5:3b", "llama3.2:3b", "phi3:mini"]
        self.model_name = None
        
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
        
        # Common action verbs for resume analysis
        self.action_verbs = {
            'leadership': ['led', 'managed', 'directed', 'supervised', 'coordinated', 'guided', 'mentored', 'coached'],
            'achievement': ['achieved', 'accomplished', 'delivered', 'exceeded', 'surpassed', 'completed', 'finished'],
            'creation': ['created', 'developed', 'designed', 'built', 'established', 'founded', 'launched', 'initiated'],
            'improvement': ['improved', 'enhanced', 'optimized', 'streamlined', 'upgraded', 'modernized', 'transformed'],
            'analysis': ['analyzed', 'evaluated', 'assessed', 'investigated', 'researched', 'examined', 'studied'],
            'communication': ['presented', 'communicated', 'negotiated', 'collaborated', 'facilitated', 'consulted']
        }
        
        # Industry-specific keywords
        self.industry_keywords = {
            'technology': ['python', 'java', 'javascript', 'react', 'node.js', 'aws', 'docker', 'kubernetes', 'api', 'database'],
            'marketing': ['seo', 'sem', 'social media', 'analytics', 'campaign', 'brand', 'content', 'digital', 'roi', 'conversion'],
            'finance': ['financial', 'accounting', 'budget', 'audit', 'compliance', 'risk', 'investment', 'excel', 'modeling'],
            'healthcare': ['patient', 'clinical', 'medical', 'treatment', 'diagnosis', 'healthcare', 'hipaa', 'emr', 'quality'],
            'sales': ['sales', 'revenue', 'quota', 'pipeline', 'crm', 'prospecting', 'closing', 'relationship', 'targets']
        }
        
        # Standard resume sections
        self.standard_sections = {
            'contact': r'contact|phone|email|address|linkedin',
            'summary': r'summary|profile|objective|about',
            'experience': r'experience|employment|work|career|professional',
            'education': r'education|academic|degree|university|college|school',
            'skills': r'skills|competencies|technical|abilities',
            'certifications': r'certification|license|credential',
            'projects': r'projects|portfolio|work samples',
            'achievements': r'achievement|award|recognition|honor'
        }
        
        # Initialize model selection
        self.select_best_available_model()
    
    def test_ollama_connection(self) -> bool:
        """Test if Ollama is accessible"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available models from Ollama"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return [model['name'] for model in models]
            return []
        except:
            return []
    
    def select_best_available_model(self):
        """Select the best available model for analysis"""
        if not self.test_ollama_connection():
            logger.info("Ollama not accessible. Using advanced rule-based analysis.")
            return
        
        available_models = self.get_available_models()
        logger.info(f"Available models: {available_models}")
        
        for preferred_model in self.preferred_models:
            for available_model in available_models:
                if preferred_model in available_model:
                    self.model_name = available_model
                    logger.info(f"Selected model: {self.model_name}")
                    return
        
        if available_models:
            self.model_name = available_models[0]
            logger.info(f"Using available model: {self.model_name}")
        else:
            logger.info("No models available. Using advanced rule-based analysis.")
    
    async def call_ollama_async(self, prompt: str, max_tokens: int = 1500) -> str:
        """Async call to Ollama API"""
        if not self.model_name:
            return "Error: No model available"
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.1,
                            "top_p": 0.9,
                            "num_predict": max_tokens,
                            "num_ctx": 2048,
                            "num_gpu": 1,
                            "num_thread": 4,
                        }
                    },
                    timeout=120
                )
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Error: Empty response")
            else:
                return f"Error: HTTP {response.status_code}"
                
        except Exception as e:
            return f"Error: {str(e)}"
    
    def safe_word_tokenize(self, text: str) -> List[str]:
        """Safe word tokenization with fallback"""
        try:
            return word_tokenize(text)
        except Exception as e:
            logger.warning(f"NLTK word_tokenize failed: {e}. Using fallback.")
            # Simple fallback tokenization
            return re.findall(r'\b\w+\b', text.lower())
    
    def safe_sent_tokenize(self, text: str) -> List[str]:
        """Safe sentence tokenization with fallback"""
        try:
            return sent_tokenize(text)
        except Exception as e:
            logger.warning(f"NLTK sent_tokenize failed: {e}. Using fallback.")
            # Simple fallback sentence tokenization using periods, exclamations, and questions
            sentences = re.split(r'[.!?]+', text)
            # Filter out empty sentences and strip whitespace
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
            return f"Error reading PDF: {str(e)}"
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            return f"Error reading DOCX: {str(e)}"
    
    def analyze_ats_compatibility(self, text: str, filename: str = "") -> tuple:
        """Advanced ATS compatibility analysis"""
        score = 0
        feedback = []
        
        # File format check
        if filename.lower().endswith(('.pdf', '.docx')):
            score += 20
            feedback.append("✓ ATS-friendly file format")
        else:
            feedback.append("⚠ Consider using PDF or DOCX format")
        
        # Text extraction quality
        if len(text) > 100:
            score += 15
            feedback.append("✓ Text successfully extracted")
        else:
            feedback.append("✗ Poor text extraction quality")
            return max(score, 10), feedback
        
        # Standard sections check
        sections_found = 0
        for section_name, pattern in self.standard_sections.items():
            if re.search(pattern, text, re.IGNORECASE):
                sections_found += 1
        
        section_score = min(sections_found * 8, 40)
        score += section_score
        
        if sections_found >= 4:
            feedback.append("✓ Good section structure")
        else:
            feedback.append("⚠ Missing some standard sections")
        
        # Contact information check
        contact_score = 0
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            contact_score += 5
        if re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text):
            contact_score += 5
        if re.search(r'linkedin|github', text, re.IGNORECASE):
            contact_score += 5
        
        score += contact_score
        if contact_score >= 10:
            feedback.append("✓ Complete contact information")
        else:
            feedback.append("⚠ Ensure all contact details are included")
        
        # Formatting consistency
        lines = text.split('\n')
        consistent_formatting = sum(1 for line in lines if line.strip()) / max(len(lines), 1)
        if consistent_formatting > 0.7:
            score += 10
            feedback.append("✓ Clean formatting detected")
    
        return min(score, 100), feedback
    
    def analyze_keywords(self, text: str, job_description: str = "") -> tuple:
        """Advanced keyword analysis"""
        score = 0
        feedback = []
        text_lower = text.lower()
        
        # Job description matching
        if job_description:
            similarity_score = self.calculate_text_similarity(text, job_description)
            keyword_match_score = int(similarity_score * 100)
            score += min(keyword_match_score, 40)
            
            if similarity_score > 0.3:
                feedback.append("✓ Good job description alignment")
            else:
                feedback.append("⚠ Low job description match - add relevant keywords")
        
        # Industry keywords detection
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            matches = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            industry_scores[industry] = matches
        
        best_industry = max(industry_scores, key=industry_scores.get)
        best_score = industry_scores[best_industry]
        
        if best_score > 3:
            score += 20
            feedback.append(f"✓ Strong {best_industry} keyword presence")
        elif best_score > 1:
            score += 10
            feedback.append(f"⚠ Some {best_industry} keywords found")
        else:
            feedback.append("⚠ Add more industry-specific keywords")
        
        # Technical skills detection
        tech_patterns = [
            r'\b[A-Z]{2,}\b',  # Acronyms
            r'\b\w+\.\w+\b',   # Technologies like React.js
            r'\b\d+\+?\s*years?\b'  # Experience years
        ]
        
        tech_matches = 0
        for pattern in tech_patterns:
            tech_matches += len(re.findall(pattern, text))
        
        if tech_matches > 10:
            score += 20
            feedback.append("✓ Rich technical vocabulary")
        elif tech_matches > 5:
            score += 10
            feedback.append("⚠ Consider adding more technical terms")
        
        # Keyword density check
        words = self.safe_word_tokenize(text_lower)
        word_freq = Counter(words)
        
        # Remove common words and check for keyword stuffing
        meaningful_words = [w for w in words if w not in self.stop_words and len(w) > 2]
        if len(meaningful_words) > 0:
            max_freq = max(word_freq.values())
            if max_freq / len(words) < 0.05:  # No word appears more than 5% of the time
                score += 20
                feedback.append("✓ Natural keyword distribution")
            else:
                feedback.append("⚠ Avoid keyword stuffing")
        
        return min(score, 100), feedback
    
    def analyze_content_quality(self, text: str) -> tuple:
        """Advanced content quality analysis"""
        score = 0
        feedback = []
        
        # Word count analysis
        words = self.safe_word_tokenize(text)
        word_count = len(words)
        
        if 300 <= word_count <= 800:
            score += 20
            feedback.append("✓ Optimal length")
        elif word_count < 300:
            score += 10
            feedback.append("⚠ Consider adding more detail")
        else:
            score += 15
            feedback.append("⚠ Consider condensing content")
        
        # Action verbs analysis
        action_verb_count = 0
        action_categories = []
        
        for category, verbs in self.action_verbs.items():
            category_matches = sum(1 for verb in verbs if verb in text.lower())
            if category_matches > 0:
                action_verb_count += category_matches
                action_categories.append(category)
        
        if action_verb_count >= 10:
            score += 25
            feedback.append("✓ Strong use of action verbs")
        elif action_verb_count >= 5:
            score += 15
            feedback.append("⚠ Good action verb usage")
        else:
            feedback.append("✗ Add more action verbs")
        
        # Quantifiable achievements
        number_patterns = [
            r'\d+%',  # Percentages
            r'\$\d+[,\d]*',  # Dollar amounts
            r'\d+[,\d]*\+?\s*(users|customers|employees|projects)',  # Numbers with units
            r'increased|decreased|improved|reduced.*?\d+',  # Achievement metrics
        ]
        
        quantifiable_count = 0
        for pattern in number_patterns:
            quantifiable_count += len(re.findall(pattern, text, re.IGNORECASE))
        
        if quantifiable_count >= 5:
            score += 25
            feedback.append("✓ Excellent use of metrics")
        elif quantifiable_count >= 2:
            score += 15
            feedback.append("⚠ Good quantifiable achievements")
        else:
            feedback.append("⚠ Add more quantifiable results")
        
        # Sentence structure analysis
        sentences = self.safe_sent_tokenize(text)
        avg_sentence_length = sum(len(self.safe_word_tokenize(s)) for s in sentences) / max(len(sentences), 1)
        
        if 15 <= avg_sentence_length <= 25:
            score += 15
            feedback.append("✓ Good sentence structure")
        else:
            feedback.append("⚠ Vary sentence length for readability")
        
        # Professional language check
        informal_words = ['awesome', 'cool', 'stuff', 'things', 'got', 'gonna', 'wanna']
        informal_count = sum(1 for word in informal_words if word in text.lower())
        
        if informal_count == 0:
            score += 15
            feedback.append("✓ Professional language")
        else:
            feedback.append("⚠ Use more formal language")
        
        return min(score, 100), feedback
    
    def analyze_grammar_spelling(self, text: str) -> tuple:
        """Advanced grammar and spelling analysis"""
        score = 80  # Start with good score
        feedback = []
        
        # Basic spelling checks using common patterns
        spelling_errors = 0
        
        # Check for common spelling mistakes
        common_mistakes = {
            'recieve': 'receive', 'seperate': 'separate', 'definately': 'definitely',
            'occured': 'occurred', 'begining': 'beginning', 'managment': 'management',
            'enviroment': 'environment', 'sucessful': 'successful'
        }
        
        for mistake, correct in common_mistakes.items():
            if mistake in text.lower():
                spelling_errors += 1
        
        # Grammar pattern checks
        grammar_issues = 0
        
        # Check for common grammar issues
        grammar_patterns = [
            r'\bi\s+am\b',  # Should be capitalized
            r'\s{2,}',      # Multiple spaces
            r'[.!?]{2,}',   # Multiple punctuation
            r'\s+[.!?]',    # Space before punctuation
        ]
        
        for pattern in grammar_patterns:
            grammar_issues += len(re.findall(pattern, text))
        
        # Scoring
        total_errors = spelling_errors + grammar_issues
        if total_errors == 0:
            feedback.append("✓ Excellent grammar and spelling")
        elif total_errors <= 3:
            score -= 10
            feedback.append("⚠ Minor grammar/spelling issues detected")
        else:
            score -= 25
            feedback.append("✗ Multiple grammar/spelling issues found")
        
        # Consistency checks
        if re.search(r'\b[A-Z]{2,}\b', text):  # Has acronyms
            feedback.append("✓ Proper use of acronyms")
        
        # Capitalization check
        sentences = self.safe_sent_tokenize(text)
        cap_errors = sum(1 for s in sentences if s and not s[0].isupper())
        
        if cap_errors / max(len(sentences), 1) < 0.1:
            feedback.append("✓ Good capitalization")
        else:
            score -= 10
            feedback.append("⚠ Check sentence capitalization")
        
        return max(min(score, 100), 0), feedback
    
    def analyze_structure_completeness(self, text: str) -> tuple:
        """Advanced structure and completeness analysis"""
        score = 0
        feedback = []
        
        # Section completeness
        required_sections = ['contact', 'experience', 'education', 'skills']
        optional_sections = ['summary', 'certifications', 'projects', 'achievements']
        
        found_required = 0
        found_optional = 0
        
        for section in required_sections:
            if section in self.standard_sections:
                pattern = self.standard_sections[section]
                if re.search(pattern, text, re.IGNORECASE):
                    found_required += 1
        
        for section in optional_sections:
            if section in self.standard_sections:
                pattern = self.standard_sections[section]
                if re.search(pattern, text, re.IGNORECASE):
                    found_optional += 1
        
        # Required sections scoring
        score += (found_required / len(required_sections)) * 50
        
        if found_required == len(required_sections):
            feedback.append("✓ All required sections present")
        else:
            missing = len(required_sections) - found_required
            feedback.append(f"⚠ Missing {missing} required section(s)")
        
        # Optional sections bonus
        score += min(found_optional * 8, 30)
        if found_optional >= 2:
            feedback.append("✓ Good section variety")
        
        # Organization analysis
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Check for clear section headers
        headers = sum(1 for line in lines if len(line) > 0 and (
            line.isupper() or 
            re.match(r'^[A-Z][a-z]+(\s+[A-Z][a-z]+)*:?$', line) or
            line.startswith('##') or line.startswith('**')
        ))
        
        if headers >= 3:
            score += 20
            feedback.append("✓ Clear section organization")
        else:
            feedback.append("⚠ Add clear section headers")
        
        return min(score, 100), feedback
    
    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between resume and job description"""
        if not text2:
            return 0.5  # Neutral score if no job description
        
        try:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
            tfidf_matrix = vectorizer.fit_transform([text1.lower(), text2.lower()])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity
        except:
            return 0.3  # Fallback similarity score
    
    async def analyze_resume_comprehensive(self, text: str, job_description: str = "", filename: str = "") -> Dict[str, Any]:
        """Main comprehensive analysis function"""
        
        if len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Resume content appears to be too short or unreadable.")
        
        start_time = time.time()
        
        # Perform all analyses
        ats_score, ats_feedback = self.analyze_ats_compatibility(text, filename)
        keywords_score, keywords_feedback = self.analyze_keywords(text, job_description)
        content_score, content_feedback = self.analyze_content_quality(text)
        grammar_score, grammar_feedback = self.analyze_grammar_spelling(text)
        structure_score, structure_feedback = self.analyze_structure_completeness(text)
        
        # Try LLM analysis if available
        llm_enhancement = ""
        if self.model_name:
            try:
                prompt = f"""Analyze this resume and provide 2-3 specific improvement suggestions:

RESUME: {text[:1000]}...

Focus on: professional impact, keyword optimization, and quantifiable achievements.
Be specific and actionable."""
                
                llm_response = await self.call_ollama_async(prompt, 300)
                if "Error" not in llm_response:
                    llm_enhancement = llm_response
            except Exception as e:
                logger.warning(f"LLM analysis failed: {e}")
        
        analysis_time = time.time() - start_time
        
        # Calculate overall score
        scores = {
            'ats': ats_score,
            'keywords': keywords_score,
            'content': content_score,
            'grammar': grammar_score,
            'structure': structure_score
        }
        
        overall_score = sum(scores.values()) / len(scores)
        
        # Determine score level and color
        if overall_score >= 85:
            score_level, score_color = "Excellent", "green"
        elif overall_score >= 70:
            score_level, score_color = "Good", "blue"
        elif overall_score >= 55:
            score_level, score_color = "Fair", "orange"
        else:
            score_level, score_color = "Needs Improvement", "red"
        
        # Add LLM insights to feedback if available
        if llm_enhancement:
            content_feedback.append(f"🤖 AI Insight: {llm_enhancement[:200]}...")
        
        # Calculate additional metrics
        words = self.safe_word_tokenize(text)
        sentences = self.safe_sent_tokenize(text)
        
        metrics = {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_sentence_length": len(words) / max(len(sentences), 1),
            "readability_score": min(max((len(words) / max(len(sentences), 1) - 10) * 5 + 50, 0), 100),
            "analysis_time_seconds": round(analysis_time, 2),
            "text_similarity_to_job": self.calculate_text_similarity(text, job_description) if job_description else 0
        }
        
        return {
            "overall_score": round(overall_score, 1),
            "score_level": score_level,
            "score_color": score_color,
            "detailed_scores": {
                "ATS Compatibility": ats_score,
                "Keyword Optimization": keywords_score,
                "Content Quality": content_score,
                "Grammar & Spelling": grammar_score,
                "Structure & Completeness": structure_score
            },
            "feedback": {
                "ATS Compatibility": ats_feedback,
                "Keyword Optimization": keywords_feedback,
                "Content Quality": content_feedback,
                "Grammar & Spelling": grammar_feedback,
                "Structure & Completeness": structure_feedback
            },
            "analysis_method": f"Advanced Analysis {'+ LLM' if self.model_name else ''}",
            "word_count": len(words),
            "analysis_timestamp": datetime.now().isoformat(),
            "metrics": metrics
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
        
        if text.startswith("Error"):
            raise HTTPException(status_code=400, detail=text)
        
        return await self.analyze_resume_comprehensive(text, job_description, filename)

# Initialize analyzer
analyzer = AdvancedATSAnalyzer()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Advanced ATS Resume Score Analyzer",
        "version": "5.0.0",
        "current_model": analyzer.model_name or "Advanced Rule-Based Analysis",
        "ollama_status": "connected" if analyzer.model_name else "using_advanced_rules",
        "features": [
            "Real NLP-based analysis",
            "Advanced keyword matching",
            "Grammar and spelling checks",
            "Content quality assessment",
            "ATS compatibility scoring",
            "Job description alignment"
        ],
        "endpoints": {
            "/analyze": "POST - Upload resume file",
            "/analyze-text": "POST - Analyze text input",
            "/health": "GET - System health check",
            "/models": "GET - Available models"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    ollama_status = "connected" if analyzer.test_ollama_connection() else "disconnected"
    
    return {
        "status": "healthy",
        "ollama_status": ollama_status,
        "current_model": analyzer.model_name or "Advanced Rules",
        "nlp_ready": analyzer.nlp is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/models")
async def list_models():
    """List available models"""
    available = analyzer.get_available_models()
    return {
        "available_models": available,
        "preferred_models": analyzer.preferred_models,
        "current_model": analyzer.model_name
    }

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form("")
):
    """Analyze uploaded resume file"""
    try:
        if not resume.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
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
    """Analyze resume from text input"""
    try:
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
    """Analyze multiple resume files at once"""
    try:
        if len(resumes) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
        
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
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@app.get("/analytics")
async def get_analytics():
    """Get system analytics and statistics"""
    return {
        "system_info": {
            "analyzer_version": "5.0.0",
            "nlp_engine": "spaCy + NLTK" if analyzer.nlp else "NLTK only",
            "llm_available": analyzer.model_name is not None,
            "current_model": analyzer.model_name or "Rule-based",
        },
        "analysis_capabilities": {
            "file_formats": ["PDF", "DOCX", "Text"],
            "languages": ["English"],
            "max_file_size": "10MB",
            "batch_processing": True,
            "real_time_analysis": True
        },
        "scoring_categories": {
            "ATS Compatibility": "File format, parsing, sections",
            "Keyword Optimization": "Job matching, industry terms",
            "Content Quality": "Action verbs, metrics, achievements",
            "Grammar & Spelling": "Language correctness, consistency",
            "Structure & Completeness": "Organization, required sections"
        }
    }

# Additional utility endpoints
@app.get("/keywords/{industry}")
async def get_industry_keywords(industry: str):
    """Get keyword suggestions for specific industry"""
    industry_lower = industry.lower()
    
    if industry_lower in analyzer.industry_keywords:
        return {
            "industry": industry,
            "keywords": analyzer.industry_keywords[industry_lower],
            "action_verbs": {
                category: verbs for category, verbs in analyzer.action_verbs.items()
            }
        }
    else:
        available_industries = list(analyzer.industry_keywords.keys())
        raise HTTPException(
            status_code=404, 
            detail=f"Industry '{industry}' not found. Available: {available_industries}"
        )

@app.post("/compare")
async def compare_resumes(
    resume1: UploadFile = File(...),
    resume2: UploadFile = File(...),
    job_description: str = Form("")
):
    """Compare two resumes side by side"""
    try:
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

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Advanced ATS Resume Analyzer...")
    print(f"📊 Analysis method: {'LLM Enhanced' if analyzer.model_name else 'Advanced Rule-Based'}")
    print(f"🧠 NLP Ready: {'Yes' if analyzer.nlp else 'Limited'}")
    print("🔧 Features: Real analysis methods, comprehensive scoring, batch processing")
    print("📈 New endpoints: /batch-analyze, /compare, /analytics, /keywords/{industry}")
    
    # Install required packages reminder
    print("\n📦 Required packages:")
    print("pip install fastapi uvicorn python-docx PyPDF2 spacy nltk scikit-learn numpy")
    print("python -m spacy download en_core_web_sm")
    
    print("\n🌐 Server starting on port 8001...")
    
    uvicorn.run(
        "ats:app",  # Replace with your actual filename if different
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )