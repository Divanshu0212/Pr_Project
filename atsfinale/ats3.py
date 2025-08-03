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
import aiohttp
from urllib.parse import urlparse, parse_qs
from typing import Tuple

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
        
        # Coding platforms configuration
        self.coding_platforms = {
            'leetcode': {
                'base_url': 'https://leetcode.com/api/problems/all/',
                'profile_pattern': r'leetcode\.com/([^/\s]+)',
                'api_endpoint': 'https://leetcode.com/graphql'
            },
            'codeforces': {
                'base_url': 'https://codeforces.com/api/',
                'profile_pattern': r'codeforces\.com/profile/([^/\s]+)',
                'api_endpoint': 'https://codeforces.com/api/user.info'
            },
            'codechef': {
                'base_url': 'https://www.codechef.com/users/',
                'profile_pattern': r'codechef\.com/users/([^/\s]+)',
                'api_endpoint': 'https://www.codechef.com/api/rankings/PRACTICE'
            }
        }
        
        # Coding performance thresholds for job readiness assessment
        self.job_readiness_thresholds = {
            'entry_level': {
                'leetcode': {'rating': 1200, 'problems_solved': 50, 'consistency_days': 30},
                'codeforces': {'rating': 800, 'problems_solved': 50, 'contest_participation': 5},
                'codechef': {'rating': 1400, 'problems_solved': 30, 'contest_participation': 3}
            },
            'mid_level': {
                'leetcode': {'rating': 1600, 'problems_solved': 150, 'consistency_days': 60},
                'codeforces': {'rating': 1200, 'problems_solved': 100, 'contest_participation': 10},
                'codechef': {'rating': 1800, 'problems_solved': 80, 'contest_participation': 8}
            },
            'senior_level': {
                'leetcode': {'rating': 2000, 'problems_solved': 300, 'consistency_days': 90},
                'codeforces': {'rating': 1600, 'problems_solved': 200, 'contest_participation': 20},
                'codechef': {'rating': 2200, 'problems_solved': 150, 'contest_participation': 15}
            }
        }
    
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
        """Advanced keyword analysis with improved job matching"""
        score = 0
        feedback = []
        text_lower = text.lower()
        
        # Enhanced job description matching
        if job_description:
            # Get detailed job match analysis
            job_match_insights = self.generate_job_match_insights(text, job_description)
            
            if "error" not in job_match_insights:
                overall_match = job_match_insights["overall_match"]
                component_scores = job_match_insights["component_scores"]
                missing_keywords = job_match_insights["missing_keywords"]
                match_level = job_match_insights["match_level"]
                
                # Score based on overall match
                keyword_match_score = int(overall_match * 0.4)  # Max 40 points
                score += keyword_match_score
                
                # Provide detailed feedback
                feedback.append(f"✓ Job Match: {match_level['level']} ({overall_match}%)")
                feedback.append(f"• Keyword Match: {component_scores['keyword_match']}%")
                feedback.append(f"• Skills Match: {component_scores['skills_match']}%")
                
                if missing_keywords:
                    feedback.append(f"⚠ Missing keywords: {', '.join(missing_keywords[:5])}")
                
                if overall_match < 60:
                    feedback.append("⚠ Consider adding more job-relevant keywords and skills")
                elif overall_match >= 80:
                    feedback.append("✓ Excellent alignment with job requirements")
            else:
                # Fallback to simple similarity
                similarity_score = self.calculate_text_similarity(text, job_description)
                keyword_match_score = int(similarity_score * 100 * 0.4)
                score += keyword_match_score
                
                if similarity_score > 0.3:
                    feedback.append("✓ Good job description alignment")
                else:
                    feedback.append("⚠ Low job description match - add relevant keywords")
        
        # Industry keywords detection with enhanced scoring
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            # Use more sophisticated matching including partial matches
            matches = 0
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    matches += 1
                # Check for partial matches (for compound terms)
                elif any(part in text_lower for part in keyword.lower().split()):
                    matches += 0.5
            industry_scores[industry] = matches
        
        best_industry = max(industry_scores, key=industry_scores.get) if industry_scores else 'technology'
        best_score = industry_scores[best_industry] if industry_scores else 0
        
        if best_score > 5:
            score += 25
            feedback.append(f"✓ Excellent {best_industry} keyword presence ({int(best_score)} matches)")
        elif best_score > 3:
            score += 20
            feedback.append(f"✓ Strong {best_industry} keyword presence ({int(best_score)} matches)")
        elif best_score > 1:
            score += 10
            feedback.append(f"⚠ Some {best_industry} keywords found ({int(best_score)} matches)")
        else:
            feedback.append("⚠ Add more industry-specific keywords")
        
        # Enhanced technical skills detection
        tech_patterns = [
            r'\b[A-Z]{2,}\b',  # Acronyms (APIs, SQL, etc.)
            r'\b\w+\.\w+\b',   # Technologies like React.js, Node.js
            r'\b\d+\+?\s*years?\b',  # Experience years
            r'\b(?:v\d+|\d+\.\d+)\b',  # Version numbers
            r'\b\w+(?:js|py|cpp|cs)\b'  # Programming language extensions
        ]
        
        tech_matches = 0
        for pattern in tech_patterns:
            matches = re.findall(pattern, text)
            tech_matches += len(matches)
        
        # Additional check for specific tech terms
        tech_terms = [
            'api', 'framework', 'library', 'database', 'cloud', 'devops', 'agile', 'scrum',
            'microservices', 'container', 'deployment', 'ci/cd', 'testing', 'automation'
        ]
        tech_term_matches = sum(1 for term in tech_terms if term in text_lower)
        tech_matches += tech_term_matches
        
        if tech_matches > 15:
            score += 25
            feedback.append(f"✓ Rich technical vocabulary ({tech_matches} technical terms)")
        elif tech_matches > 10:
            score += 20
            feedback.append(f"✓ Good technical vocabulary ({tech_matches} technical terms)")
        elif tech_matches > 5:
            score += 10
            feedback.append(f"⚠ Consider adding more technical terms ({tech_matches} found)")
        else:
            feedback.append("⚠ Add more technical terminology")
        
        # Improved keyword density analysis
        words = self.safe_word_tokenize(text_lower)
        word_freq = Counter(words)
        
        # Remove common words and check for keyword stuffing
        meaningful_words = [w for w in words if w not in self.stop_words and len(w) > 2]
        if len(meaningful_words) > 0:
            max_freq = max(word_freq.values()) if word_freq else 0
            total_words = len(words)
            
            # Check for keyword stuffing (any word appearing too frequently)
            if max_freq / total_words < 0.03:  # Less than 3% frequency
                score += 10
                feedback.append("✓ Natural keyword distribution")
            elif max_freq / total_words < 0.05:  # Less than 5% frequency
                score += 5
                feedback.append("⚠ Watch keyword density")
            else:
                feedback.append("⚠ Avoid keyword stuffing - vary your vocabulary")
        
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
        """Advanced similarity calculation between resume and job description"""
        if not text2:
            return 0.5  # Neutral score if no job description
        
        try:
            # Multi-layered similarity calculation
            
            # 1. TF-IDF Cosine Similarity (baseline)
            vectorizer = TfidfVectorizer(
                stop_words='english', 
                max_features=1000,
                ngram_range=(1, 2),  # Include bigrams for better context
                min_df=1,
                max_df=0.95
            )
            tfidf_matrix = vectorizer.fit_transform([text1.lower(), text2.lower()])
            tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # 2. Keyword overlap analysis
            keyword_similarity = self.calculate_keyword_overlap(text1, text2)
            
            # 3. Skills matching
            skills_similarity = self.calculate_skills_match(text1, text2)
            
            # 4. Experience level matching
            experience_similarity = self.calculate_experience_match(text1, text2)
            
            # 5. Education/qualification matching
            education_similarity = self.calculate_education_match(text1, text2)
            
            # Weighted combination of different similarity measures
            weights = {
                'tfidf': 0.25,
                'keywords': 0.30,
                'skills': 0.25,
                'experience': 0.10,
                'education': 0.10
            }
            
            final_similarity = (
                tfidf_similarity * weights['tfidf'] +
                keyword_similarity * weights['keywords'] +
                skills_similarity * weights['skills'] +
                experience_similarity * weights['experience'] +
                education_similarity * weights['education']
            )
            
            return min(final_similarity, 1.0)
            
        except Exception as e:
            logger.warning(f"Similarity calculation failed: {e}")
            return 0.3  # Fallback similarity score

    def calculate_keyword_overlap(self, resume_text: str, job_text: str) -> float:
        """Calculate keyword overlap between resume and job description"""
        try:
            # Extract important keywords from job description
            job_keywords = self.extract_job_keywords(job_text)
            resume_keywords = self.extract_resume_keywords(resume_text)
            
            # Calculate overlap
            if not job_keywords:
                return 0.5
                
            overlap = len(job_keywords.intersection(resume_keywords))
            total_job_keywords = len(job_keywords)
            
            return overlap / total_job_keywords if total_job_keywords > 0 else 0.0
            
        except:
            return 0.3

    def extract_job_keywords(self, job_text: str) -> set:
        """Extract important keywords from job description"""
        keywords = set()
        text_lower = job_text.lower()
        
        # Technical skills patterns
        tech_patterns = [
            r'\b(?:python|java|javascript|react|node\.js|sql|aws|docker|kubernetes|git)\b',
            r'\b(?:machine learning|data science|artificial intelligence|deep learning)\b',
            r'\b(?:frontend|backend|full[- ]?stack|devops|mobile|web)\b',
            r'\b(?:agile|scrum|kanban|ci/cd|microservices|api)\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text_lower)
            keywords.update(matches)
        
        # Extract required skills from common patterns
        skill_patterns = [
            r'(?:experience with|proficient in|knowledge of|familiar with)\s+([^.]+)',
            r'(?:required|must have|should have):\s*([^.]+)',
            r'(?:skills|technologies|tools):\s*([^.]+)'
        ]
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                # Split on common separators and clean
                skills = re.split(r'[,;/&]', match)
                for skill in skills:
                    clean_skill = skill.strip().lower()
                    if len(clean_skill) > 2 and clean_skill not in self.stop_words:
                        keywords.add(clean_skill)
        
        return keywords

    def extract_resume_keywords(self, resume_text: str) -> set:
        """Extract keywords from resume"""
        keywords = set()
        text_lower = resume_text.lower()
        
        # Extract technical terms, tools, and skills
        words = self.safe_word_tokenize(text_lower)
        
        # Filter for technical terms (no common words)
        technical_words = [
            word for word in words 
            if len(word) > 2 
            and word not in self.stop_words
            and not word.isdigit()
        ]
        
        keywords.update(technical_words)
        return keywords

    def calculate_skills_match(self, resume_text: str, job_text: str) -> float:
        """Calculate how well resume skills match job requirements"""
        try:
            # Define comprehensive skill categories
            skill_categories = {
                'programming': [
                    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
                    'scala', 'kotlin', 'swift', 'dart', 'r', 'matlab', 'perl', 'shell', 'bash'
                ],
                'web_frontend': [
                    'react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
                    'jquery', 'webpack', 'babel', 'npm', 'yarn', 'typescript'
                ],
                'web_backend': [
                    'node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'asp.net',
                    'fastapi', 'nestjs', 'koa', 'gin', 'fiber'
                ],
                'databases': [
                    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
                    'sql server', 'cassandra', 'dynamodb', 'firebase'
                ],
                'cloud_devops': [
                    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions',
                    'terraform', 'ansible', 'chef', 'puppet', 'vagrant'
                ],
                'data_science': [
                    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'matplotlib',
                    'seaborn', 'plotly', 'jupyter', 'r', 'stata', 'spss'
                ],
                'mobile': [
                    'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin',
                    'ionic', 'cordova', 'native script'
                ]
            }
            
            resume_lower = resume_text.lower()
            job_lower = job_text.lower()
            
            total_score = 0
            matched_categories = 0
            
            for category, skills in skill_categories.items():
                job_skills = [skill for skill in skills if skill in job_lower]
                resume_skills = [skill for skill in skills if skill in resume_lower]
                
                if job_skills:  # Only score if job requires skills from this category
                    matched_skills = set(job_skills).intersection(set(resume_skills))
                    category_score = len(matched_skills) / len(job_skills) if job_skills else 0
                    total_score += category_score
                    matched_categories += 1
            
            return total_score / matched_categories if matched_categories > 0 else 0.5
            
        except:
            return 0.3

    def calculate_experience_match(self, resume_text: str, job_text: str) -> float:
        """Calculate experience level matching"""
        try:
            # Extract experience requirements from job
            job_exp_pattern = r'(\d+)[\+\-\s]*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
            job_matches = re.findall(job_exp_pattern, job_text.lower())
            
            if not job_matches:
                return 0.5  # No experience requirement specified
            
            required_exp = max([int(exp) for exp in job_matches])
            
            # Extract experience from resume
            resume_exp_patterns = [
                r'(\d+)[\+\s]*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
                r'(?:experience|exp).*?(\d+)[\+\s]*(?:years?|yrs?)',
                r'(\d{4})\s*[-–]\s*(?:present|current|\d{4})'  # Date ranges
            ]
            
            resume_experiences = []
            for pattern in resume_exp_patterns:
                matches = re.findall(pattern, resume_text.lower())
                resume_experiences.extend([int(exp) for exp in matches if exp.isdigit()])
            
            if not resume_experiences:
                return 0.3  # No experience found
            
            max_resume_exp = max(resume_experiences)
            
            # Calculate match score
            if max_resume_exp >= required_exp:
                return 1.0  # Meets or exceeds requirement
            elif max_resume_exp >= required_exp * 0.8:
                return 0.8  # Close to requirement
            elif max_resume_exp >= required_exp * 0.5:
                return 0.6  # Partial match
            else:
                return 0.3  # Significant gap
                
        except:
            return 0.5

    def calculate_education_match(self, resume_text: str, job_text: str) -> float:
        """Calculate education/qualification matching"""
        try:
            # Education levels hierarchy
            education_levels = {
                'phd': 5, 'doctorate': 5, 'ph.d': 5,
                'masters': 4, 'master': 4, 'msc': 4, 'mba': 4, 'ms': 4,
                'bachelors': 3, 'bachelor': 3, 'bsc': 3, 'ba': 3, 'btech': 3, 'be': 3,
                'associate': 2, 'diploma': 2,
                'certificate': 1, 'certification': 1
            }
            
            def get_education_level(text):
                max_level = 0
                for edu, level in education_levels.items():
                    if edu in text.lower():
                        max_level = max(max_level, level)
                return max_level
            
            job_edu_level = get_education_level(job_text)
            resume_edu_level = get_education_level(resume_text)
            
            if job_edu_level == 0:  # No education requirement
                return 0.7
            
            if resume_edu_level >= job_edu_level:
                return 1.0
            elif resume_edu_level >= job_edu_level - 1:
                return 0.8
            else:
                return 0.4
                
        except:
            return 0.6

    def generate_job_match_insights(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Generate detailed job matching insights"""
        if not job_description:
            return {"error": "No job description provided for matching analysis"}
        
        try:
            # Calculate individual match components
            overall_similarity = self.calculate_text_similarity(resume_text, job_description)
            keyword_match = self.calculate_keyword_overlap(resume_text, job_description)
            skills_match = self.calculate_skills_match(resume_text, job_description)
            experience_match = self.calculate_experience_match(resume_text, job_description)
            education_match = self.calculate_education_match(resume_text, job_description)
            
            # Extract missing keywords
            job_keywords = self.extract_job_keywords(job_description)
            resume_keywords = self.extract_resume_keywords(resume_text)
            missing_keywords = job_keywords - resume_keywords
            
            # Generate recommendations
            recommendations = []
            
            if keyword_match < 0.6:
                recommendations.append({
                    "category": "Keywords",
                    "priority": "High",
                    "suggestion": f"Add missing keywords: {', '.join(list(missing_keywords)[:10])}"
                })
            
            if skills_match < 0.7:
                recommendations.append({
                    "category": "Skills",
                    "priority": "High",
                    "suggestion": "Highlight more relevant technical skills mentioned in the job description"
                })
            
            if experience_match < 0.8:
                recommendations.append({
                    "category": "Experience",
                    "priority": "Medium",
                    "suggestion": "Emphasize relevant work experience and projects that align with job requirements"
                })
            
            return {
                "overall_match": round(overall_similarity * 100, 1),
                "component_scores": {
                    "keyword_match": round(keyword_match * 100, 1),
                    "skills_match": round(skills_match * 100, 1),
                    "experience_match": round(experience_match * 100, 1),
                    "education_match": round(education_match * 100, 1)
                },
                "missing_keywords": list(missing_keywords)[:15],
                "recommendations": recommendations,
                "match_level": self.get_match_level(overall_similarity)
            }
            
        except Exception as e:
            logger.error(f"Job match analysis failed: {e}")
            return {"error": "Failed to analyze job match"}

    def get_match_level(self, similarity_score: float) -> Dict[str, str]:
        """Get match level description"""
        if similarity_score >= 0.8:
            return {
                "level": "Excellent Match",
                "description": "Your resume strongly aligns with the job requirements",
                "color": "green"
            }
        elif similarity_score >= 0.6:
            return {
                "level": "Good Match",
                "description": "Your resume shows good alignment with some areas for improvement",
                "color": "blue"
            }
        elif similarity_score >= 0.4:
            return {
                "level": "Moderate Match",
                "description": "Your resume has potential but needs significant optimization",
                "color": "orange"
            }
        else:
            return {
                "level": "Low Match",
                "description": "Your resume requires major updates to align with this job",
                "color": "red"
            }
    
    def generate_detailed_insights(self, text: str, job_description: str, ats_score: int, keywords_score: int, content_score: int) -> Dict[str, Any]:
        """Generate comprehensive insights and recommendations"""
        insights = {
            "executive_summary": self.generate_executive_summary(ats_score, keywords_score, content_score),
            "priority_improvements": self.identify_priority_improvements(ats_score, keywords_score, content_score),
            "detailed_recommendations": {
                "Professional Impact": self.get_professional_impact_recommendations(text, content_score),
                "Keyword Optimization": self.get_keyword_recommendations(text, job_description, keywords_score),
                "Content Enhancement": self.get_content_enhancement_recommendations(text),
                "ATS Optimization": self.get_ats_optimization_recommendations(text, ats_score),
                "Industry Alignment": self.get_industry_alignment_recommendations(text)
            },
            "action_plan": self.generate_action_plan(ats_score, keywords_score, content_score),
            "examples": self.provide_improvement_examples(text, job_description)
        }
        
        return insights

    def generate_executive_summary(self, ats_score: int, keywords_score: int, content_score: int) -> Dict[str, Any]:
        """Generate an executive summary of the analysis"""
        overall_score = (ats_score + keywords_score + content_score) / 3
        
        if overall_score >= 85:
            status = "Excellent"
            message = "Your resume demonstrates strong ATS compatibility and professional presentation."
        elif overall_score >= 70:
            status = "Good"
            message = "Your resume shows solid fundamentals with room for targeted improvements."
        elif overall_score >= 55:
            status = "Needs Improvement"
            message = "Your resume requires significant enhancements to improve ATS compatibility."
        else:
            status = "Poor"
            message = "Your resume needs major restructuring to pass ATS systems effectively."
        
        return {
            "overall_score": round(overall_score, 1),
            "status": status,
            "message": message,
            "strengths": self.identify_strengths(ats_score, keywords_score, content_score),
            "areas_for_improvement": self.identify_weaknesses(ats_score, keywords_score, content_score)
        }

    def identify_priority_improvements(self, ats_score: int, keywords_score: int, content_score: int) -> List[Dict[str, Any]]:
        """Identify top 3 priority improvements"""
        improvements = []
        
        if ats_score < 70:
            improvements.append({
                "priority": "High",
                "category": "ATS Compatibility",
                "issue": "Resume format may not parse correctly in ATS systems",
                "impact": "Your resume might not be seen by hiring managers",
                "quick_fix": "Use standard section headers and simple formatting"
            })
        
        if keywords_score < 60:
            improvements.append({
                "priority": "High",
                "category": "Keyword Optimization",
                "issue": "Insufficient job-relevant keywords",
                "impact": "Lower ranking in ATS keyword searches",
                "quick_fix": "Add 5-7 relevant keywords from the job description"
            })
        
        if content_score < 65:
            improvements.append({
                "priority": "Medium",
                "category": "Content Quality",
                "issue": "Lacks quantifiable achievements and impact metrics",
                "impact": "Fails to demonstrate concrete value to employers",
                "quick_fix": "Add numbers and percentages to your accomplishments"
            })
        
        return improvements[:3]

    def get_professional_impact_recommendations(self, text: str, content_score: int) -> List[Dict[str, Any]]:
        """Generate professional impact recommendations"""
        recommendations = []
        
        # Check for quantifiable achievements
        numbers_count = len(re.findall(r'\d+', text))
        if numbers_count < 5:
            recommendations.append({
                "type": "Quantifiable Impact",
                "suggestion": "Add specific metrics to demonstrate your achievements",
                "example": "Instead of 'Improved system performance' write 'Improved system performance by 35%, reducing load times from 3.2s to 2.1s'",
                "priority": "High"
            })
        
        # Check for action verbs
        strong_verbs = ['achieved', 'developed', 'implemented', 'optimized', 'increased', 'reduced', 'managed', 'led']
        verb_count = sum(1 for verb in strong_verbs if verb in text.lower())
        
        if verb_count < 5:
            recommendations.append({
                "type": "Action-Oriented Language",
                "suggestion": "Start bullet points with strong action verbs",
                "example": "Replace 'Responsible for database management' with 'Optimized database queries, reducing execution time by 40%'",
                "priority": "Medium"
            })
        
        # Check for leadership indicators
        leadership_terms = ['led', 'managed', 'supervised', 'coordinated', 'mentored']
        has_leadership = any(term in text.lower() for term in leadership_terms)
        
        if not has_leadership:
            recommendations.append({
                "type": "Leadership Experience",
                "suggestion": "Highlight any leadership or mentoring experiences",
                "example": "Add: 'Led a team of 4 developers to deliver project 2 weeks ahead of schedule'",
                "priority": "Medium"
            })
        
        return recommendations

    def get_keyword_recommendations(self, text: str, job_description: str, keywords_score: int) -> List[Dict[str, Any]]:
        """Generate keyword optimization recommendations"""
        recommendations = []
        
        if job_description:
            # Extract keywords from job description
            job_words = set(re.findall(r'\b[A-Za-z]{3,}\b', job_description.lower()))
            resume_words = set(re.findall(r'\b[A-Za-z]{3,}\b', text.lower()))
            missing_keywords = (job_words - resume_words - self.stop_words)
            
            # Filter for technical and relevant terms
            technical_terms = [word for word in missing_keywords 
                             if word in ['python', 'java', 'react', 'sql', 'aws', 'docker', 'kubernetes', 
                                       'machine learning', 'data science', 'agile', 'scrum']]
            
            if technical_terms:
                recommendations.append({
                    "type": "Missing Technical Keywords",
                    "suggestion": f"Add these relevant technical terms: {', '.join(list(technical_terms)[:5])}",
                    "example": f"Include '{technical_terms[0]}' in your skills or project descriptions",
                    "priority": "High"
                })
        
        # Industry-specific recommendations
        detected_industry = self.detect_industry(text)
        if detected_industry and detected_industry in self.industry_keywords:
            industry_kw = self.industry_keywords[detected_industry]
            missing_industry_kw = [kw for kw in industry_kw if kw.lower() not in text.lower()]
            
            if missing_industry_kw:
                recommendations.append({
                    "type": f"{detected_industry.title()} Industry Keywords",
                    "suggestion": f"Add {detected_industry} industry keywords to strengthen your profile",
                    "example": f"Consider adding: {', '.join(missing_industry_kw[:3])}",
                    "priority": "Medium"
                })
        
        return recommendations

    def get_content_enhancement_recommendations(self, text: str) -> List[Dict[str, Any]]:
        """Generate content enhancement recommendations"""
        recommendations = [
            {
                "type": "STAR Method Implementation",
                "suggestion": "Structure your achievements using the STAR method",
                "example": "Situation: 'During high-traffic period' → Task: 'Needed to optimize server performance' → Action: 'Implemented caching strategy' → Result: 'Reduced response time by 50%'",
                "priority": "High"
            },
            {
                "type": "Professional Summary",
                "suggestion": "Add a compelling professional summary at the top",
                "example": "'Results-driven Software Engineer with 3+ years experience in full-stack development, specializing in React and Node.js, with proven track record of delivering scalable solutions that improve user experience by 40%+'",
                "priority": "Medium"
            },
            {
                "type": "Skills Organization",
                "suggestion": "Organize skills by category for better readability",
                "example": "Technical Skills: Python, Java, React | Tools: Docker, Git, AWS | Soft Skills: Leadership, Problem-solving",
                "priority": "Low"
            }
        ]
        
        return recommendations

    def get_ats_optimization_recommendations(self, text: str, ats_score: int) -> List[Dict[str, Any]]:
        """Generate ATS optimization recommendations"""
        recommendations = []
        
        # Check for standard sections
        sections = ['experience', 'education', 'skills']
        missing_sections = [section for section in sections if section not in text.lower()]
        
        if missing_sections:
            recommendations.append({
                "type": "Section Headers",
                "suggestion": f"Add standard section headers: {', '.join(missing_sections)}",
                "example": "Use clear headers like 'WORK EXPERIENCE' or 'EDUCATION'",
                "priority": "High"
            })
        
        # Check for contact information
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text))
        has_phone = bool(re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text))
        
        if not (has_email and has_phone):
            recommendations.append({
                "type": "Contact Information",
                "suggestion": "Ensure email and phone number are clearly visible",
                "example": "Add at top: 'john.doe@email.com | (555) 123-4567'",
                "priority": "High"
            })
        
        return recommendations

    def get_industry_alignment_recommendations(self, text: str) -> List[Dict[str, Any]]:
        """Generate industry alignment recommendations"""
        detected_industry = self.detect_industry(text)
        recommendations = []
        
        if detected_industry:
            recommendations.append({
                "type": f"{detected_industry.title()} Industry Focus",
                "suggestion": f"Strengthen your {detected_industry} industry profile",
                "example": f"Highlight {detected_industry}-specific technologies and methodologies",
                "priority": "Medium"
            })
        
        return recommendations

    def generate_action_plan(self, ats_score: int, keywords_score: int, content_score: int) -> List[Dict[str, Any]]:
        """Generate a step-by-step action plan"""
        action_plan = []
        
        # Immediate actions (can be done in 1 hour)
        action_plan.append({
            "timeline": "Immediate (1 hour)",
            "actions": [
                "Add missing contact information (email, phone, LinkedIn)",
                "Use standard section headers (Experience, Education, Skills)",
                "Add 3-5 relevant keywords from the job description"
            ]
        })
        
        # Short-term actions (can be done in 1 day)
        action_plan.append({
            "timeline": "Short-term (1 day)",
            "actions": [
                "Rewrite 3 bullet points using action verbs and quantifiable results",
                "Add a professional summary highlighting your key value proposition",
                "Organize skills into clear categories"
            ]
        })
        
        # Medium-term actions (can be done in 1 week)
        action_plan.append({
            "timeline": "Medium-term (1 week)",
            "actions": [
                "Restructure all experience descriptions using the STAR method",
                "Research and add industry-specific certifications or courses",
                "Optimize keyword density while maintaining natural flow"
            ]
        })
        
        return action_plan

    def provide_improvement_examples(self, text: str, job_description: str) -> Dict[str, List[Dict[str, str]]]:
        """Provide before/after examples for improvements"""
        examples = {
            "bullet_points": [
                {
                    "before": "Worked on database optimization",
                    "after": "Optimized database queries using indexing and query restructuring, reducing average response time by 45% and improving user experience for 10,000+ daily users"
                },
                {
                    "before": "Responsible for team management",
                    "after": "Led cross-functional team of 6 developers and designers to deliver 3 major features ahead of schedule, resulting in 25% increase in user engagement"
                }
            ],
            "professional_summary": [
                {
                    "before": "Computer Science student looking for opportunities",
                    "after": "Results-driven Computer Science student with hands-on experience in full-stack development, machine learning, and cloud technologies. Proven track record of delivering innovative solutions that improve system performance by 40%+ and reduce operational costs."
                }
            ],
            "skills_organization": [
                {
                    "before": "Python, JavaScript, React, Node.js, AWS, Docker, Git, SQL",
                    "after": "Programming: Python, JavaScript, C++ | Frontend: React.js, HTML5, CSS3 | Backend: Node.js, Express.js | Cloud: AWS, Docker | Database: SQL, MongoDB"
                }
            ]
        }
        
        return examples

    def identify_strengths(self, ats_score: int, keywords_score: int, content_score: int) -> List[str]:
        """Identify resume strengths"""
        strengths = []
        
        if ats_score >= 80:
            strengths.append("Good ATS compatibility and formatting")
        if keywords_score >= 75:
            strengths.append("Strong keyword optimization")
        if content_score >= 75:
            strengths.append("High-quality content with clear achievements")
        
        return strengths

    def identify_weaknesses(self, ats_score: int, keywords_score: int, content_score: int) -> List[str]:
        """Identify areas needing improvement"""
        weaknesses = []
        
        if ats_score < 70:
            weaknesses.append("ATS formatting and compatibility issues")
        if keywords_score < 65:
            weaknesses.append("Insufficient job-relevant keywords")
        if content_score < 70:
            weaknesses.append("Lacks quantifiable achievements and impact metrics")
        
        return weaknesses

    def detect_industry(self, text: str) -> str:
        """Detect the most likely industry based on resume content"""
        text_lower = text.lower()
        industry_scores = {}
        
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        return "general"
    
    def detect_industry(self, text: str) -> str:
        """Detect the most likely industry based on resume content"""
        text_lower = text.lower()
        industry_scores = {}
        
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text_lower)
            industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        return ""
    
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
        
        # Generate detailed AI insights
        ai_insights = self.generate_detailed_insights(text, job_description, ats_score, keywords_score, content_score)
        
        # Try LLM analysis if available for additional insights
        llm_enhancement = ""
        if self.model_name:
            try:
                prompt = f"""Analyze this resume and provide 3-4 specific, actionable improvement suggestions:

RESUME: {text[:1500]}

JOB DESCRIPTION: {job_description[:500] if job_description else "General professional role"}

Provide detailed suggestions for:
1. Professional impact enhancement
2. Keyword optimization 
3. Quantifiable achievements
4. Industry-specific improvements

Be specific and actionable with examples."""
                
                llm_response = await self.call_ollama_async(prompt, 800)
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
        
        # Add LLM insights and detailed recommendations to feedback
        feedback_with_insights = {
            "ATS Compatibility": ats_feedback,
            "Keyword Optimization": keywords_feedback,
            "Content Quality": content_feedback,
            "Grammar & Spelling": grammar_feedback,
            "Structure & Completeness": structure_feedback
        }
        
        if llm_enhancement:
            feedback_with_insights["AI Analysis"] = [f"🤖 {llm_enhancement}"]
        
        # Calculate additional metrics
        words = self.safe_word_tokenize(text)
        sentences = self.safe_sent_tokenize(text)
        
        # Generate job match insights if job description provided
        job_match_insights = None
        if job_description:
            job_match_insights = self.generate_job_match_insights(text, job_description)
        
        metrics = {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_sentence_length": len(words) / max(len(sentences), 1),
            "readability_score": min(max((len(words) / max(len(sentences), 1) - 10) * 5 + 50, 0), 100),
            "analysis_time_seconds": round(analysis_time, 2),
            "text_similarity_to_job": self.calculate_text_similarity(text, job_description) if job_description else 0
        }
        
        result = {
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
            "feedback": feedback_with_insights,
            "detailed_insights": ai_insights,
            "analysis_method": f"Advanced Analysis {'+ LLM' if self.model_name else ''}",
            "word_count": len(words),
            "analysis_timestamp": datetime.now().isoformat(),
            "metrics": metrics
        }
        
        # Add job match insights if available
        if job_match_insights and "error" not in job_match_insights:
            result["job_match_analysis"] = job_match_insights
        
        return result
    
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

# ==================== CODING PROFILES ANALYSIS ====================
    
    def extract_profile_links(self, text: str) -> Dict[str, List[str]]:
        """Extract coding profile links from resume text"""
        profiles = {
            'leetcode': [],
            'codeforces': [],
            'codechef': []
        }
        
        # Enhanced URL patterns to catch various formats
        url_patterns = [
            r'https?://[^\s<>"{}|\\^`\[\]]*',
            r'www\.[^\s<>"{}|\\^`\[\]]*',
            r'[a-zA-Z0-9.-]+\.com/[^\s<>"{}|\\^`\[\]]*'
        ]
        
        all_urls = []
        for pattern in url_patterns:
            all_urls.extend(re.findall(pattern, text, re.IGNORECASE))
        
        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in all_urls:
            if url.lower() not in seen:
                seen.add(url.lower())
                unique_urls.append(url)
        
        # Extract platform-specific profiles
        for url in unique_urls:
            url_lower = url.lower()
            
            # LeetCode
            if 'leetcode.com' in url_lower:
                match = re.search(self.coding_platforms['leetcode']['profile_pattern'], url, re.IGNORECASE)
                if match:
                    username = match.group(1).strip('/')
                    if username and username not in ['problems', 'contest', 'discuss', 'explore']:
                        profiles['leetcode'].append({
                            'username': username,
                            'url': url,
                            'clean_url': f"https://leetcode.com/{username}/"
                        })
            
            # Codeforces
            elif 'codeforces.com' in url_lower:
                match = re.search(self.coding_platforms['codeforces']['profile_pattern'], url, re.IGNORECASE)
                if match:
                    username = match.group(1).strip('/')
                    if username and username not in ['contests', 'problemset', 'gym']:
                        profiles['codeforces'].append({
                            'username': username,
                            'url': url,
                            'clean_url': f"https://codeforces.com/profile/{username}"
                        })
            
            # CodeChef
            elif 'codechef.com' in url_lower:
                match = re.search(self.coding_platforms['codechef']['profile_pattern'], url, re.IGNORECASE)
                if match:
                    username = match.group(1).strip('/')
                    if username and username not in ['ide', 'problems', 'contests']:
                        profiles['codechef'].append({
                            'username': username,
                            'url': url,
                            'clean_url': f"https://www.codechef.com/users/{username}"
                        })
        
        return profiles
    
    async def fetch_leetcode_stats(self, username: str) -> Dict[str, Any]:
        """Fetch LeetCode profile statistics"""
        try:
            # GraphQL query for LeetCode API
            query = """
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        realName
                        ranking
                    }
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    userContestRanking(username: $username) {
                        attendedContestsCount
                        rating
                        globalRanking
                        topPercentage
                    }
                }
            }
            """
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.post(
                    self.coding_platforms['leetcode']['api_endpoint'],
                    json={'query': query, 'variables': {'username': username}},
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        user_data = data.get('data', {}).get('matchedUser')
                        
                        if user_data:
                            # Parse submission statistics
                            submit_stats = user_data.get('submitStats', {}).get('acSubmissionNum', [])
                            total_solved = sum(stat.get('count', 0) for stat in submit_stats)
                            
                            easy_solved = next((stat.get('count', 0) for stat in submit_stats if stat.get('difficulty') == 'Easy'), 0)
                            medium_solved = next((stat.get('count', 0) for stat in submit_stats if stat.get('difficulty') == 'Medium'), 0)
                            hard_solved = next((stat.get('count', 0) for stat in submit_stats if stat.get('difficulty') == 'Hard'), 0)
                            
                            # Contest ranking info
                            contest_ranking = user_data.get('userContestRanking') or {}
                            
                            return {
                                'platform': 'leetcode',
                                'username': username,
                                'total_solved': total_solved,
                                'easy_solved': easy_solved,
                                'medium_solved': medium_solved,
                                'hard_solved': hard_solved,
                                'contest_rating': contest_ranking.get('rating', 0),
                                'contests_attended': contest_ranking.get('attendedContestsCount', 0),
                                'global_ranking': contest_ranking.get('globalRanking', 0),
                                'top_percentage': contest_ranking.get('topPercentage', 0),
                                'profile_ranking': user_data.get('profile', {}).get('ranking', 0),
                                'real_name': user_data.get('profile', {}).get('realName', ''),
                                'status': 'success'
                            }
                    
                    return {'platform': 'leetcode', 'username': username, 'status': 'error', 'message': 'Profile not found or private'}
                    
        except Exception as e:
            return {'platform': 'leetcode', 'username': username, 'status': 'error', 'message': str(e)}
    
    async def fetch_codeforces_stats(self, username: str) -> Dict[str, Any]:
        """Fetch Codeforces profile statistics"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                # Get user info
                async with session.get(f"{self.coding_platforms['codeforces']['api_endpoint']}?handles={username}") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('status') == 'OK' and data.get('result'):
                            user_info = data['result'][0]
                            
                            # Get user submissions for problem count
                            try:
                                async with session.get(f"https://codeforces.com/api/user.status?handle={username}") as sub_response:
                                    if sub_response.status == 200:
                                        sub_data = await sub_response.json()
                                        if sub_data.get('status') == 'OK':
                                            submissions = sub_data.get('result', [])
                                            
                                            # Count unique solved problems
                                            solved_problems = set()
                                            for submission in submissions:
                                                if submission.get('verdict') == 'OK':
                                                    problem_id = f"{submission.get('problem', {}).get('contestId', '')}{submission.get('problem', {}).get('index', '')}"
                                                    solved_problems.add(problem_id)
                                            
                                            problems_solved = len(solved_problems)
                                        else:
                                            problems_solved = 0
                                    else:
                                        problems_solved = 0
                            except:
                                problems_solved = 0
                            
                            return {
                                'platform': 'codeforces',
                                'username': username,
                                'rating': user_info.get('rating', 0),
                                'max_rating': user_info.get('maxRating', 0),
                                'rank': user_info.get('rank', 'unrated'),
                                'max_rank': user_info.get('maxRank', 'unrated'),
                                'problems_solved': problems_solved,
                                'contribution': user_info.get('contribution', 0),
                                'country': user_info.get('country', ''),
                                'organization': user_info.get('organization', ''),
                                'first_name': user_info.get('firstName', ''),
                                'last_name': user_info.get('lastName', ''),
                                'status': 'success'
                            }
                    
                    return {'platform': 'codeforces', 'username': username, 'status': 'error', 'message': 'Profile not found'}
                    
        except Exception as e:
            return {'platform': 'codeforces', 'username': username, 'status': 'error', 'message': str(e)}
    
    async def fetch_codechef_stats(self, username: str) -> Dict[str, Any]:
        """Fetch CodeChef profile statistics (limited due to API restrictions)"""
        try:
            # CodeChef doesn't have a public API, so we'll do basic profile validation
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                profile_url = f"https://www.codechef.com/users/{username}"
                
                async with session.get(profile_url) as response:
                    if response.status == 200:
                        html_content = await response.text()
                        
                        # Basic parsing for publicly available info
                        rating_match = re.search(r'rating["\s:]*(\d+)', html_content, re.IGNORECASE)
                        rating = int(rating_match.group(1)) if rating_match else 0
                        
                        problems_match = re.search(r'problems["\s:]*(\d+)', html_content, re.IGNORECASE)
                        problems_solved = int(problems_match.group(1)) if problems_match else 0
                        
                        return {
                            'platform': 'codechef',
                            'username': username,
                            'rating': rating,
                            'problems_solved': problems_solved,
                            'profile_url': profile_url,
                            'status': 'success',
                            'note': 'Limited data due to API restrictions'
                        }
                    else:
                        return {'platform': 'codechef', 'username': username, 'status': 'error', 'message': 'Profile not found'}
                        
        except Exception as e:
            return {'platform': 'codechef', 'username': username, 'status': 'error', 'message': str(e)}
    
    def assess_job_readiness(self, profile_stats: List[Dict[str, Any]], target_level: str = 'entry_level') -> Dict[str, Any]:
        """Assess job readiness based on coding profile statistics"""
        assessment = {
            'overall_score': 0,
            'readiness_level': 'Not Ready',
            'platform_assessments': {},
            'recommendations': [],
            'strengths': [],
            'areas_for_improvement': [],
            'target_level': target_level
        }
        
        if target_level not in self.job_readiness_thresholds:
            target_level = 'entry_level'
        
        thresholds = self.job_readiness_thresholds[target_level]
        platform_scores = []
        
        for stats in profile_stats:
            if stats.get('status') != 'success':
                continue
                
            platform = stats['platform']
            if platform not in thresholds:
                continue
                
            platform_threshold = thresholds[platform]
            platform_assessment = {
                'platform': platform,
                'score': 0,
                'meets_requirements': False,
                'details': {}
            }
            
            # Platform-specific assessment
            if platform == 'leetcode':
                rating_score = min(stats.get('contest_rating', 0) / platform_threshold['rating'], 1.0) * 40
                problems_score = min(stats.get('total_solved', 0) / platform_threshold['problems_solved'], 1.0) * 40
                consistency_score = 20  # Placeholder - would need activity data
                
                platform_assessment['score'] = rating_score + problems_score + consistency_score
                platform_assessment['details'] = {
                    'rating': stats.get('contest_rating', 0),
                    'required_rating': platform_threshold['rating'],
                    'problems_solved': stats.get('total_solved', 0),
                    'required_problems': platform_threshold['problems_solved'],
                    'contests_attended': stats.get('contests_attended', 0)
                }
                
                if (stats.get('contest_rating', 0) >= platform_threshold['rating'] and 
                    stats.get('total_solved', 0) >= platform_threshold['problems_solved']):
                    platform_assessment['meets_requirements'] = True
                    
            elif platform == 'codeforces':
                rating_score = min(stats.get('rating', 0) / platform_threshold['rating'], 1.0) * 50
                problems_score = min(stats.get('problems_solved', 0) / platform_threshold['problems_solved'], 1.0) * 30
                contribution_score = min(stats.get('contribution', 0) / 50, 1.0) * 20
                
                platform_assessment['score'] = rating_score + problems_score + contribution_score
                platform_assessment['details'] = {
                    'rating': stats.get('rating', 0),
                    'required_rating': platform_threshold['rating'],
                    'problems_solved': stats.get('problems_solved', 0),
                    'required_problems': platform_threshold['problems_solved'],
                    'rank': stats.get('rank', 'unrated')
                }
                
                if (stats.get('rating', 0) >= platform_threshold['rating'] and 
                    stats.get('problems_solved', 0) >= platform_threshold['problems_solved']):
                    platform_assessment['meets_requirements'] = True
                    
            elif platform == 'codechef':
                rating_score = min(stats.get('rating', 0) / platform_threshold['rating'], 1.0) * 60
                problems_score = min(stats.get('problems_solved', 0) / platform_threshold['problems_solved'], 1.0) * 40
                
                platform_assessment['score'] = rating_score + problems_score
                platform_assessment['details'] = {
                    'rating': stats.get('rating', 0),
                    'required_rating': platform_threshold['rating'],
                    'problems_solved': stats.get('problems_solved', 0),
                    'required_problems': platform_threshold['problems_solved']
                }
                
                if (stats.get('rating', 0) >= platform_threshold['rating'] and 
                    stats.get('problems_solved', 0) >= platform_threshold['problems_solved']):
                    platform_assessment['meets_requirements'] = True
            
            assessment['platform_assessments'][platform] = platform_assessment
            platform_scores.append(platform_assessment['score'])
        
        # Calculate overall assessment
        if platform_scores:
            assessment['overall_score'] = sum(platform_scores) / len(platform_scores)
            
            # Determine readiness level
            if assessment['overall_score'] >= 80:
                assessment['readiness_level'] = 'Excellent - Ready for Senior Roles'
            elif assessment['overall_score'] >= 65:
                assessment['readiness_level'] = 'Good - Ready for Mid-Level Roles'
            elif assessment['overall_score'] >= 50:
                assessment['readiness_level'] = 'Fair - Ready for Entry-Level Roles'
            elif assessment['overall_score'] >= 30:
                assessment['readiness_level'] = 'Developing - Continue Practice'
            else:
                assessment['readiness_level'] = 'Beginner - Needs Significant Improvement'
        
        # Generate recommendations
        assessment['recommendations'] = self.generate_coding_recommendations(assessment)
        
        return assessment
    
    def generate_coding_recommendations(self, assessment: Dict[str, Any]) -> List[str]:
        """Generate personalized coding practice recommendations"""
        recommendations = []
        
        for platform, platform_assessment in assessment['platform_assessments'].items():
            score = platform_assessment['score']
            details = platform_assessment['details']
            
            if platform == 'leetcode':
                if details.get('rating', 0) < 1400:
                    recommendations.append("🎯 Focus on LeetCode Easy and Medium problems to build rating")
                if details.get('problems_solved', 0) < 100:
                    recommendations.append("📚 Solve more LeetCode problems - aim for 2-3 problems daily")
                if details.get('contests_attended', 0) < 5:
                    recommendations.append("🏆 Participate in LeetCode weekly contests for rating boost")
                    
            elif platform == 'codeforces':
                if details.get('rating', 0) < 1000:
                    recommendations.append("🚀 Practice Codeforces problems rated 800-1200 to improve rating")
                if details.get('problems_solved', 0) < 50:
                    recommendations.append("⚡ Solve more Codeforces problems - focus on implementation and math")
                    
            elif platform == 'codechef':
                if details.get('rating', 0) < 1600:
                    recommendations.append("🧠 Participate in CodeChef contests to improve rating")
                if details.get('problems_solved', 0) < 50:
                    recommendations.append("🔧 Practice CodeChef problems in different categories")
        
        # General recommendations based on overall score
        overall_score = assessment['overall_score']
        if overall_score < 30:
            recommendations.extend([
                "📖 Start with basic programming concepts and data structures",
                "⏰ Dedicate 1-2 hours daily to coding practice",
                "🎯 Focus on one platform initially to build momentum"
            ])
        elif overall_score < 60:
            recommendations.extend([
                "🔄 Practice consistently across multiple platforms",
                "📊 Focus on weak areas identified in the assessment",
                "👥 Join coding communities for motivation and learning"
            ])
        
        return recommendations
    
    async def analyze_coding_profiles(self, resume_text: str) -> Dict[str, Any]:
        """Main function to analyze coding profiles from resume"""
        
        # Extract profile links
        profile_links = self.extract_profile_links(resume_text)
        
        analysis_result = {
            'profiles_found': profile_links,
            'profile_statistics': [],
            'job_readiness_assessment': None,
            'summary': {
                'total_profiles': 0,
                'accessible_profiles': 0,
                'total_problems_solved': 0,
                'average_rating': 0,
                'platforms_with_good_activity': []
            }
        }
        
        # Fetch statistics for each platform
        all_tasks = []
        
        for platform, profiles in profile_links.items():
            for profile in profiles:
                username = profile['username']
                
                if platform == 'leetcode':
                    all_tasks.append(self.fetch_leetcode_stats(username))
                elif platform == 'codeforces':
                    all_tasks.append(self.fetch_codeforces_stats(username))
                elif platform == 'codechef':
                    all_tasks.append(self.fetch_codechef_stats(username))
        
        # Execute all API calls concurrently
        if all_tasks:
            try:
                profile_stats = await asyncio.gather(*all_tasks, return_exceptions=True)
                
                # Filter successful results
                successful_stats = []
                for stat in profile_stats:
                    if isinstance(stat, dict) and stat.get('status') == 'success':
                        successful_stats.append(stat)
                        analysis_result['summary']['accessible_profiles'] += 1
                        
                        # Update summary statistics
                        if stat['platform'] == 'leetcode':
                            analysis_result['summary']['total_problems_solved'] += stat.get('total_solved', 0)
                            if stat.get('contest_rating', 0) > 0:
                                analysis_result['summary']['average_rating'] += stat.get('contest_rating', 0)
                        elif stat['platform'] == 'codeforces':
                            analysis_result['summary']['total_problems_solved'] += stat.get('problems_solved', 0)
                            if stat.get('rating', 0) > 0:
                                analysis_result['summary']['average_rating'] += stat.get('rating', 0)
                        elif stat['platform'] == 'codechef':
                            analysis_result['summary']['total_problems_solved'] += stat.get('problems_solved', 0)
                            if stat.get('rating', 0) > 0:
                                analysis_result['summary']['average_rating'] += stat.get('rating', 0)
                
                analysis_result['profile_statistics'] = profile_stats
                
                # Calculate average rating
                if analysis_result['summary']['accessible_profiles'] > 0:
                    analysis_result['summary']['average_rating'] /= analysis_result['summary']['accessible_profiles']
                
                # Assess job readiness
                if successful_stats:
                    analysis_result['job_readiness_assessment'] = self.assess_job_readiness(successful_stats)
                
            except Exception as e:
                logger.error(f"Error fetching profile statistics: {e}")
        
        # Count total profiles found
        analysis_result['summary']['total_profiles'] = sum(len(profiles) for profiles in profile_links.values())
        
        return analysis_result
    
    # ==================== END CODING PROFILES ANALYSIS ====================
    
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