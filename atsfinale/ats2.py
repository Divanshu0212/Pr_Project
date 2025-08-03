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
import bs4
from bs4 import BeautifulSoup
import fitz  # PyMuPDF for better PDF URL extraction

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

class CodingProfile(BaseModel):
    platform: str
    username: str
    url: str
    rating: Optional[int] = None
    max_rating: Optional[int] = None
    problems_solved: Optional[int] = None
    contests_participated: Optional[int] = None
    rank: Optional[str] = None
    last_activity: Optional[str] = None
    consistency_score: Optional[float] = None

class CodingProfileAnalysis(BaseModel):
    profiles_found: List[CodingProfile]
    overall_coding_score: float
    job_readiness_level: str
    recommendations: List[str]
    strengths: List[str]
    areas_for_improvement: List[str]

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
        
        # Coding platform patterns for URL detection
        self.coding_platforms = {
            'leetcode': {
                'patterns': [
                    r'https?://(?:www\.)?leetcode\.com/(?:u/)?([^/\s]+)',
                    r'leetcode\.com/(?:u/)?([^/\s]+)',
                    r'lc\.com/([^/\s]+)'
                ],
                'api_base': 'https://leetcode.com/graphql',
                'rating_thresholds': {
                    'beginner': 0,
                    'intermediate': 1400,
                    'advanced': 1800,
                    'expert': 2200
                }
            },
            'codeforces': {
                'patterns': [
                    r'https?://(?:www\.)?codeforces\.com/profile/([^/\s]+)',
                    r'codeforces\.com/profile/([^/\s]+)',
                    r'cf\.com/profile/([^/\s]+)'
                ],
                'api_base': 'https://codeforces.com/api',
                'rating_thresholds': {
                    'newbie': 0,
                    'pupil': 1200,
                    'specialist': 1400,
                    'expert': 1600,
                    'candidate_master': 1900,
                    'master': 2100,
                    'international_master': 2300,
                    'grandmaster': 2400
                }
            },
            'codechef': {
                'patterns': [
                    r'https?://(?:www\.)?codechef\.com/users/([^/\s]+)',
                    r'codechef\.com/users/([^/\s]+)',
                    r'cc\.com/users/([^/\s]+)'
                ],
                'api_base': 'https://www.codechef.com/api',
                'rating_thresholds': {
                    'unrated': 0,
                    '1_star': 1400,
                    '2_star': 1600,
                    '3_star': 1800,
                    '4_star': 2000,
                    '5_star': 2200,
                    '6_star': 2500,
                    '7_star': 3000
                }
            }
        }
        
        # Job role coding requirements
        self.job_coding_requirements = {
            'software_engineer': {
                'min_problems': 200,
                'min_rating': 1500,
                'consistency_months': 6
            },
            'senior_software_engineer': {
                'min_problems': 400,
                'min_rating': 1700,
                'consistency_months': 12
            },
            'tech_lead': {
                'min_problems': 500,
                'min_rating': 1800,
                'consistency_months': 18
            },
            'sde_intern': {
                'min_problems': 100,
                'min_rating': 1200,
                'consistency_months': 3
            },
            'data_scientist': {
                'min_problems': 150,
                'min_rating': 1400,
                'consistency_months': 6
            }
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

    def extract_urls_from_pdf(self, file_content: bytes) -> List[str]:
        """Extract URLs/hyperlinks from PDF file using PyMuPDF"""
        urls = []
        try:
            # Use PyMuPDF for better URL extraction
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document.load_page(page_num)
                
                # Extract links from page
                links = page.get_links()
                for link in links:
                    if 'uri' in link:
                        urls.append(link['uri'])
                
                # Also extract text and search for URL patterns
                text = page.get_text()
                url_patterns = [
                    r'https?://[^\s\)]+',
                    r'www\.[^\s\)]+\.[^\s\)]+',
                    r'[a-zA-Z0-9.-]+\.com[^\s\)]*',
                    r'[a-zA-Z0-9.-]+\.org[^\s\)]*'
                ]
                
                for pattern in url_patterns:
                    found_urls = re.findall(pattern, text)
                    urls.extend(found_urls)
            
            pdf_document.close()
            
            # Clean and deduplicate URLs
            clean_urls = []
            for url in urls:
                url = url.strip('.,;!?)')
                if url and len(url) > 8:  # Basic URL length check
                    if not url.startswith('http'):
                        url = 'https://' + url
                    clean_urls.append(url)
            
            return list(set(clean_urls))  # Remove duplicates
            
        except Exception as e:
            logger.warning(f"URL extraction from PDF failed: {e}")
            
            # Fallback: extract from text using regex
            try:
                text = self.extract_text_from_pdf(file_content)
                url_patterns = [
                    r'https?://[^\s\)]+',
                    r'www\.[^\s\)]+\.[^\s\)]+',
                    r'leetcode\.com[^\s\)]*',
                    r'codeforces\.com[^\s\)]*',
                    r'codechef\.com[^\s\)]*'
                ]
                
                urls = []
                for pattern in url_patterns:
                    found_urls = re.findall(pattern, text)
                    urls.extend(found_urls)
                
                return list(set(urls))
                
            except Exception as fallback_error:
                logger.error(f"Fallback URL extraction failed: {fallback_error}")
                return []

    def extract_coding_profiles_from_text(self, text: str) -> List[Dict[str, str]]:
        """Extract coding platform profiles from text"""
        profiles = []
        
        for platform, config in self.coding_platforms.items():
            for pattern in config['patterns']:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        username = match[0] if match else None
                    else:
                        username = match
                    
                    if username and len(username) > 1:
                        # Construct full URL
                        if platform == 'leetcode':
                            url = f"https://leetcode.com/u/{username}"
                        elif platform == 'codeforces':
                            url = f"https://codeforces.com/profile/{username}"
                        elif platform == 'codechef':
                            url = f"https://www.codechef.com/users/{username}"
                        else:
                            url = f"https://{platform}.com/{username}"
                        
                        profiles.append({
                            'platform': platform,
                            'username': username,
                            'url': url
                        })
        
        # Remove duplicates
        unique_profiles = []
        seen = set()
        for profile in profiles:
            key = (profile['platform'], profile['username'].lower())
            if key not in seen:
                seen.add(key)
                unique_profiles.append(profile)
        
        return unique_profiles

    async def fetch_leetcode_profile(self, username: str) -> Dict[str, Any]:
        """Fetch LeetCode profile data"""
        try:
            # LeetCode GraphQL query
            query = """
            query getUserProfile($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    username
                    profile {
                        ranking
                        userAvatar
                        realName
                        aboutMe
                        reputation
                    }
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    badges {
                        id
                        displayName
                        icon
                        creationDate
                    }
                }
            }
            """
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.post(
                    'https://leetcode.com/graphql',
                    json={'query': query, 'variables': {'username': username}},
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('data', {}).get('matchedUser'):
                            user_data = data['data']['matchedUser']
                            submit_stats = user_data.get('submitStats', {}).get('acSubmissionNum', [])
                            
                            total_solved = 0
                            easy_solved = 0
                            medium_solved = 0
                            hard_solved = 0
                            
                            for stat in submit_stats:
                                if stat['difficulty'] == 'All':
                                    total_solved = stat['count']
                                elif stat['difficulty'] == 'Easy':
                                    easy_solved = stat['count']
                                elif stat['difficulty'] == 'Medium':
                                    medium_solved = stat['count']
                                elif stat['difficulty'] == 'Hard':
                                    hard_solved = stat['count']
                            
                            profile_data = user_data.get('profile', {})
                            
                            return {
                                'platform': 'leetcode',
                                'username': username,
                                'url': f"https://leetcode.com/u/{username}",
                                'problems_solved': total_solved,
                                'easy_solved': easy_solved,
                                'medium_solved': medium_solved,
                                'hard_solved': hard_solved,
                                'ranking': profile_data.get('ranking'),
                                'reputation': profile_data.get('reputation', 0),
                                'badges': len(user_data.get('badges', [])),
                                'real_name': profile_data.get('realName', ''),
                                'status': 'success'
                            }
                        else:
                            return {'platform': 'leetcode', 'username': username, 'status': 'user_not_found'}
                    else:
                        return {'platform': 'leetcode', 'username': username, 'status': 'api_error'}
        
        except Exception as e:
            logger.warning(f"LeetCode API error for {username}: {e}")
            return {'platform': 'leetcode', 'username': username, 'status': 'error', 'error': str(e)}

    async def fetch_codeforces_profile(self, username: str) -> Dict[str, Any]:
        """Fetch Codeforces profile data"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                # Fetch user info
                async with session.get(f'https://codeforces.com/api/user.info?handles={username}') as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('status') == 'OK' and data.get('result'):
                            user_info = data['result'][0]
                            
                            # Fetch user submissions
                            async with session.get(f'https://codeforces.com/api/user.status?handle={username}&from=1&count=1000') as sub_response:
                                submissions_data = {}
                                if sub_response.status == 200:
                                    sub_data = await sub_response.json()
                                    if sub_data.get('status') == 'OK':
                                        submissions = sub_data.get('result', [])
                                        
                                        # Count accepted problems
                                        accepted_problems = set()
                                        for submission in submissions:
                                            if submission.get('verdict') == 'OK':
                                                problem_id = f"{submission.get('problem', {}).get('contestId')}-{submission.get('problem', {}).get('index')}"
                                                accepted_problems.add(problem_id)
                                        
                                        submissions_data = {
                                            'problems_solved': len(accepted_problems),
                                            'total_submissions': len(submissions)
                                        }
                            
                            return {
                                'platform': 'codeforces',
                                'username': username,
                                'url': f"https://codeforces.com/profile/{username}",
                                'rating': user_info.get('rating'),
                                'max_rating': user_info.get('maxRating'),
                                'rank': user_info.get('rank', ''),
                                'max_rank': user_info.get('maxRank', ''),
                                'problems_solved': submissions_data.get('problems_solved', 0),
                                'total_submissions': submissions_data.get('total_submissions', 0),
                                'contribution': user_info.get('contribution', 0),
                                'last_online': user_info.get('lastOnlineTimeSeconds'),
                                'registration_time': user_info.get('registrationTimeSeconds'),
                                'status': 'success'
                            }
                        else:
                            return {'platform': 'codeforces', 'username': username, 'status': 'user_not_found'}
                    else:
                        return {'platform': 'codeforces', 'username': username, 'status': 'api_error'}
        
        except Exception as e:
            logger.warning(f"Codeforces API error for {username}: {e}")
            return {'platform': 'codeforces', 'username': username, 'status': 'error', 'error': str(e)}

    async def fetch_codechef_profile(self, username: str) -> Dict[str, Any]:
        """Fetch CodeChef profile data (web scraping as API is limited)"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=15)) as session:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
                
                async with session.get(f'https://www.codechef.com/users/{username}', headers=headers) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        # Extract rating
                        rating = None
                        rating_elements = soup.find_all(['div', 'span'], class_=re.compile(r'rating'))
                        for element in rating_elements:
                            text = element.get_text().strip()
                            rating_match = re.search(r'(\d{3,4})', text)
                            if rating_match:
                                rating = int(rating_match.group(1))
                                break
                        
                        # Extract problems solved
                        problems_solved = 0
                        problem_elements = soup.find_all(text=re.compile(r'problems?\s+solved', re.IGNORECASE))
                        for element in problem_elements:
                            parent = element.parent
                            if parent:
                                numbers = re.findall(r'\d+', parent.get_text())
                                if numbers:
                                    problems_solved = int(numbers[0])
                                    break
                        
                        # Extract star rating
                        stars = 0
                        star_elements = soup.find_all(['span', 'div'], class_=re.compile(r'star'))
                        for element in star_elements:
                            star_text = element.get_text()
                            star_match = re.search(r'(\d+)\s*star', star_text, re.IGNORECASE)
                            if star_match:
                                stars = int(star_match.group(1))
                                break
                        
                        # Extract rank
                        rank = ""
                        rank_elements = soup.find_all(text=re.compile(r'rank|position', re.IGNORECASE))
                        for element in rank_elements:
                            parent = element.parent
                            if parent:
                                rank_text = parent.get_text().strip()
                                if 'global' in rank_text.lower():
                                    numbers = re.findall(r'\d+', rank_text)
                                    if numbers:
                                        rank = f"Global Rank: {numbers[0]}"
                                        break
                        
                        return {
                            'platform': 'codechef',
                            'username': username,
                            'url': f"https://www.codechef.com/users/{username}",
                            'rating': rating,
                            'stars': stars,
                            'problems_solved': problems_solved,
                            'rank': rank,
                            'status': 'success'
                        }
                    else:
                        return {'platform': 'codechef', 'username': username, 'status': 'user_not_found'}
        
        except Exception as e:
            logger.warning(f"CodeChef scraping error for {username}: {e}")
            return {'platform': 'codechef', 'username': username, 'status': 'error', 'error': str(e)}

    async def analyze_coding_profiles(self, profiles: List[Dict[str, str]]) -> Dict[str, Any]:
        """Analyze coding profiles and determine job readiness"""
        if not profiles:
            return {
                'profiles_found': [],
                'overall_coding_score': 0,
                'job_readiness_level': 'No Coding Profiles Found',
                'recommendations': ['Add coding profile links to your resume (LeetCode, Codeforces, CodeChef)'],
                'strengths': [],
                'areas_for_improvement': ['Create and maintain coding profiles to demonstrate programming skills']
            }
        
        analyzed_profiles = []
        total_score = 0
        active_profiles = 0
        
        # Fetch profile data for each platform
        for profile in profiles:
            platform = profile['platform']
            username = profile['username']
            
            if platform == 'leetcode':
                profile_data = await self.fetch_leetcode_profile(username)
            elif platform == 'codeforces':
                profile_data = await self.fetch_codeforces_profile(username)
            elif platform == 'codechef':
                profile_data = await self.fetch_codechef_profile(username)
            else:
                continue
            
            if profile_data.get('status') == 'success':
                analyzed_profiles.append(profile_data)
                
                # Calculate individual platform score
                platform_score = self.calculate_platform_score(profile_data)
                total_score += platform_score
                active_profiles += 1
        
        # Calculate overall coding score
        overall_score = total_score / max(active_profiles, 1) if active_profiles > 0 else 0
        
        # Determine job readiness level
        job_readiness = self.determine_job_readiness(analyzed_profiles, overall_score)
        
        # Generate recommendations
        recommendations = self.generate_coding_recommendations(analyzed_profiles, overall_score)
        
        # Identify strengths and areas for improvement
        strengths = self.identify_coding_strengths(analyzed_profiles)
        areas_for_improvement = self.identify_coding_improvements(analyzed_profiles)
        
        return {
            'profiles_found': analyzed_profiles,
            'overall_coding_score': round(overall_score, 1),
            'job_readiness_level': job_readiness,
            'recommendations': recommendations,
            'strengths': strengths,
            'areas_for_improvement': areas_for_improvement,
            'analysis_timestamp': datetime.now().isoformat()
        }

    def calculate_platform_score(self, profile_data: Dict[str, Any]) -> float:
        """Calculate score for individual platform"""
        platform = profile_data['platform']
        score = 0
        
        if platform == 'leetcode':
            problems_solved = profile_data.get('problems_solved', 0)
            easy_solved = profile_data.get('easy_solved', 0)
            medium_solved = profile_data.get('medium_solved', 0)
            hard_solved = profile_data.get('hard_solved', 0)
            
            # Base score from problems solved
            score += min(problems_solved * 0.5, 40)  # Max 40 points
            
            # Bonus for difficulty distribution
            if medium_solved > 0:
                score += min(medium_solved * 0.3, 20)  # Max 20 points
            if hard_solved > 0:
                score += min(hard_solved * 0.5, 20)  # Max 20 points
            
            # Ranking bonus
            ranking = profile_data.get('ranking')
            if ranking:
                if ranking <= 10000:
                    score += 20
                elif ranking <= 50000:
                    score += 15
                elif ranking <= 100000:
                    score += 10
                else:
                    score += 5
        
        elif platform == 'codeforces':
            rating = profile_data.get('rating', 0)
            max_rating = profile_data.get('max_rating', 0)
            problems_solved = profile_data.get('problems_solved', 0)
            
            # Rating-based score
            if rating >= 2100:  # Master+
                score += 50
            elif rating >= 1900:  # Candidate Master
                score += 40
            elif rating >= 1600:  # Expert
                score += 30
            elif rating >= 1400:  # Specialist
                score += 25
            elif rating >= 1200:  # Pupil
                score += 20
            else:
                score += 10
            
            # Problems solved bonus
            score += min(problems_solved * 0.3, 30)
            
            # Max rating bonus
            if max_rating > rating:
                score += min((max_rating - rating) * 0.01, 10)
        
        elif platform == 'codechef':
            rating = profile_data.get('rating', 0)
            stars = profile_data.get('stars', 0)
            problems_solved = profile_data.get('problems_solved', 0)
            
            # Star-based score
            star_scores = {1: 15, 2: 20, 3: 25, 4: 30, 5: 40, 6: 50, 7: 60}
            score += star_scores.get(stars, 10)
            
            # Rating bonus
            if rating > 0:
                score += min(rating * 0.02, 20)
            
            # Problems solved bonus
            score += min(problems_solved * 0.4, 20)
        
        return min(score, 100)  # Cap at 100

    def determine_job_readiness(self, profiles: List[Dict[str, Any]], overall_score: float) -> str:
        """Determine job readiness level based on coding profiles"""
        if not profiles:
            return "No Coding Profiles Found"
        
        if overall_score >= 80:
            return "Excellent - Ready for Senior Roles"
        elif overall_score >= 65:
            return "Good - Ready for Mid-Level Roles"
        elif overall_score >= 45:
            return "Fair - Suitable for Junior Roles"
        elif overall_score >= 25:
            return "Basic - Needs Improvement for Technical Roles"
        else:
            return "Insufficient - Significant Practice Required"

    def generate_coding_recommendations(self, profiles: List[Dict[str, Any]], overall_score: float) -> List[str]:
        """Generate coding improvement recommendations"""
        recommendations = []
        
        if not profiles:
            return [
                "Create accounts on LeetCode, Codeforces, and CodeChef",
                "Start with easy problems and gradually increase difficulty",
                "Aim to solve at least 3-5 problems per week",
                "Participate in weekly contests to improve problem-solving speed"
            ]
        
        # Platform-specific recommendations
        has_leetcode = any(p['platform'] == 'leetcode' for p in profiles)
        has_codeforces = any(p['platform'] == 'codeforces' for p in profiles)
        has_codechef = any(p['platform'] == 'codechef' for p in profiles)
        
        if not has_leetcode:
            recommendations.append("Create a LeetCode profile - essential for technical interviews")
        
        if not has_codeforces:
            recommendations.append("Join Codeforces for algorithmic problem solving and contests")
        
        if not has_codechef:
            recommendations.append("Create a CodeChef account for diverse programming challenges")
        
        # Score-based recommendations
        if overall_score < 30:
            recommendations.extend([
                "Focus on solving at least 5 problems per week consistently",
                "Start with easy problems to build confidence and fundamentals",
                "Learn basic data structures: arrays, strings, linked lists, stacks, queues"
            ])
        elif overall_score < 50:
            recommendations.extend([
                "Increase problem-solving frequency to 7-10 problems per week",
                "Focus on medium difficulty problems",
                "Learn advanced data structures: trees, graphs, heaps, hash maps"
            ])
        elif overall_score < 70:
            recommendations.extend([
                "Participate in weekly contests to improve speed and ranking",
                "Tackle hard problems to strengthen advanced concepts",
                "Focus on dynamic programming and graph algorithms"
            ])
        else:
            recommendations.extend([
                "Maintain consistent practice to keep skills sharp",
                "Mentor others and contribute to open source projects",
                "Focus on system design and optimization problems"
            ])
        
        return recommendations[:6]  # Limit to top 6 recommendations

    def identify_coding_strengths(self, profiles: List[Dict[str, Any]]) -> List[str]:
        """Identify coding profile strengths"""
        strengths = []
        
        for profile in profiles:
            platform = profile['platform']
            
            if platform == 'leetcode':
                problems_solved = profile.get('problems_solved', 0)
                if problems_solved >= 300:
                    strengths.append(f"Strong LeetCode profile with {problems_solved}+ problems solved")
                elif problems_solved >= 100:
                    strengths.append(f"Good LeetCode progress with {problems_solved} problems solved")
                
                ranking = profile.get('ranking')
                if ranking and ranking <= 50000:
                    strengths.append(f"Good LeetCode ranking (Top {ranking:,})")
            
            elif platform == 'codeforces':
                rating = profile.get('rating', 0)
                if rating >= 1600:
                    strengths.append(f"Strong Codeforces rating ({rating}) - Expert level")
                elif rating >= 1400:
                    strengths.append(f"Good Codeforces rating ({rating}) - Specialist level")
                
                problems_solved = profile.get('problems_solved', 0)
                if problems_solved >= 200:
                    strengths.append(f"Extensive Codeforces experience with {problems_solved}+ problems")
            
            elif platform == 'codechef':
                stars = profile.get('stars', 0)
                if stars >= 4:
                    strengths.append(f"High CodeChef rating ({stars} stars)")
                elif stars >= 2:
                    strengths.append(f"Good CodeChef performance ({stars} stars)")
        
        if len(profiles) >= 2:
            strengths.append("Active on multiple coding platforms")
        
        return strengths

    def identify_coding_improvements(self, profiles: List[Dict[str, Any]]) -> List[str]:
        """Identify areas for coding improvement"""
        improvements = []
        
        if not profiles:
            return ["No coding profiles found - create accounts on coding platforms"]
        
        for profile in profiles:
            platform = profile['platform']
            
            if platform == 'leetcode':
                problems_solved = profile.get('problems_solved', 0)
                hard_solved = profile.get('hard_solved', 0)
                
                if problems_solved < 100:
                    improvements.append("Increase LeetCode problem solving frequency")
                
                if hard_solved < 10 and problems_solved > 50:
                    improvements.append("Practice more hard difficulty problems on LeetCode")
            
            elif platform == 'codeforces':
                rating = profile.get('rating', 0)
                if rating < 1400:
                    improvements.append("Work on improving Codeforces rating through contest participation")
            
            elif platform == 'codechef':
                stars = profile.get('stars', 0)
                if stars < 3:
                    improvements.append("Focus on improving CodeChef star rating")
        
        # General improvements
        if len(profiles) == 1:
            improvements.append("Diversify by joining additional coding platforms")
        
        return improvements[:4]  # Limit to top 4 improvements
    
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
    
    async def analyze_resume_comprehensive(self, text: str, job_description: str = "", filename: str = "", file_content: bytes = None) -> Dict[str, Any]:
        """Main comprehensive analysis function with coding profile analysis"""
        
        if len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Resume content appears to be too short or unreadable.")
        
        start_time = time.time()
        
        # Perform all analyses
        ats_score, ats_feedback = self.analyze_ats_compatibility(text, filename)
        keywords_score, keywords_feedback = self.analyze_keywords(text, job_description)
        content_score, content_feedback = self.analyze_content_quality(text)
        grammar_score, grammar_feedback = self.analyze_grammar_spelling(text)
        structure_score, structure_feedback = self.analyze_structure_completeness(text)
        
        # CODING PROFILES ANALYSIS - NEW FEATURE
        coding_analysis = None
        if file_content and filename.lower().endswith('.pdf'):
            try:
                # Extract URLs from PDF
                urls = self.extract_urls_from_pdf(file_content)
                
                # Extract coding profiles from text and URLs
                profiles_from_text = self.extract_coding_profiles_from_text(text)
                profiles_from_urls = []
                
                for url in urls:
                    url_profiles = self.extract_coding_profiles_from_text(url)
                    profiles_from_urls.extend(url_profiles)
                
                # Combine and deduplicate profiles
                all_profiles = profiles_from_text + profiles_from_urls
                unique_profiles = []
                seen = set()
                for profile in all_profiles:
                    key = (profile['platform'], profile['username'].lower())
                    if key not in seen:
                        seen.add(key)
                        unique_profiles.append(profile)
                
                # Analyze coding profiles
                coding_analysis = await self.analyze_coding_profiles(unique_profiles)
                
                logger.info(f"Found {len(unique_profiles)} coding profiles for analysis")
                
            except Exception as e:
                logger.warning(f"Coding profile analysis failed: {e}")
                coding_analysis = {
                    'profiles_found': [],
                    'overall_coding_score': 0,
                    'job_readiness_level': 'Analysis Failed',
                    'recommendations': ['Could not analyze coding profiles - ensure URLs are accessible'],
                    'strengths': [],
                    'areas_for_improvement': [],
                    'error': str(e)
                }
        else:
            # Fallback: extract from text only
            try:
                profiles_from_text = self.extract_coding_profiles_from_text(text)
                coding_analysis = await self.analyze_coding_profiles(profiles_from_text)
            except Exception as e:
                logger.warning(f"Text-based coding profile analysis failed: {e}")
                coding_analysis = {
                    'profiles_found': [],
                    'overall_coding_score': 0,
                    'job_readiness_level': 'No Profiles Found',
                    'recommendations': ['Add coding platform URLs to your resume'],
                    'strengths': [],
                    'areas_for_improvement': ['Create and maintain coding profiles']
                }
        
        # Generate detailed AI insights
        ai_insights = self.generate_detailed_insights(text, job_description, ats_score, keywords_score, content_score)
        
        # Try LLM analysis if available for additional insights
        llm_enhancement = ""
        if self.model_name:
            try:
                prompt = f"""Analyze this resume and provide 3-4 specific, actionable improvement suggestions:

RESUME: {text[:1500]}

JOB DESCRIPTION: {job_description[:500] if job_description else "General professional role"}

CODING PROFILES: {len(coding_analysis.get('profiles_found', []))} found with overall score {coding_analysis.get('overall_coding_score', 0)}

Provide detailed suggestions for:
1. Professional impact enhancement
2. Keyword optimization 
3. Quantifiable achievements
4. Industry-specific improvements
5. Coding profile optimization (if applicable)

Be specific and actionable with examples."""
                
                llm_response = await self.call_ollama_async(prompt, 800)
                if "Error" not in llm_response:
                    llm_enhancement = llm_response
            except Exception as e:
                logger.warning(f"LLM analysis failed: {e}")
        
        analysis_time = time.time() - start_time
        
        # Calculate overall score (including coding score if available)
        scores = {
            'ats': ats_score,
            'keywords': keywords_score,
            'content': content_score,
            'grammar': grammar_score,
            'structure': structure_score
        }
        
        # Add coding score to overall calculation if coding profiles found
        if coding_analysis and coding_analysis.get('profiles_found'):
            coding_score = min(coding_analysis.get('overall_coding_score', 0), 100)
            scores['coding'] = coding_score
        
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
        
        # Add coding profile feedback if available
        if coding_analysis and coding_analysis.get('profiles_found'):
            coding_feedback = []
            coding_feedback.append(f"✓ Found {len(coding_analysis['profiles_found'])} coding profiles")
            coding_feedback.append(f"📊 Overall coding score: {coding_analysis['overall_coding_score']}")
            coding_feedback.append(f"🎯 Job readiness: {coding_analysis['job_readiness_level']}")
            
            if coding_analysis.get('strengths'):
                for strength in coding_analysis['strengths'][:2]:
                    coding_feedback.append(f"✓ {strength}")
            
            if coding_analysis.get('recommendations'):
                for rec in coding_analysis['recommendations'][:2]:
                    coding_feedback.append(f"⚠ {rec}")
            
            feedback_with_insights["Coding Profiles"] = coding_feedback
        else:
            feedback_with_insights["Coding Profiles"] = [
                "⚠ No coding profiles found in resume",
                "💡 Add LeetCode, Codeforces, or CodeChef profile links",
                "🎯 Coding profiles are crucial for technical roles"
            ]
        
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
            "text_similarity_to_job": self.calculate_text_similarity(text, job_description) if job_description else 0,
            "coding_profiles_count": len(coding_analysis.get('profiles_found', [])) if coding_analysis else 0
        }
        
        # Prepare detailed scores
        detailed_scores = {
            "ATS Compatibility": ats_score,
            "Keyword Optimization": keywords_score,
            "Content Quality": content_score,
            "Grammar & Spelling": grammar_score,
            "Structure & Completeness": structure_score
        }
        
        # Add coding score if available
        if coding_analysis and coding_analysis.get('profiles_found'):
            detailed_scores["Coding Profiles"] = min(coding_analysis.get('overall_coding_score', 0), 100)
        
        result = {
            "overall_score": round(overall_score, 1),
            "score_level": score_level,
            "score_color": score_color,
            "detailed_scores": detailed_scores,
            "feedback": feedback_with_insights,
            "detailed_insights": ai_insights,
            "analysis_method": f"Advanced Analysis {'+ LLM' if self.model_name else ''} + Coding Profiles",
            "word_count": len(words),
            "analysis_timestamp": datetime.now().isoformat(),
            "metrics": metrics
        }
        
        # Add coding profile analysis results
        if coding_analysis:
            result["coding_profiles_analysis"] = coding_analysis
        
        # Add job match insights if available
        if job_match_insights and "error" not in job_match_insights:
            result["job_match_analysis"] = job_match_insights
        
        return result
    
    async def analyze_resume_file(self, file_content: bytes, filename: str, job_description: str = "") -> Dict[str, Any]:
        """Analyze resume from file upload with coding profile extraction"""
        
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_content)
        elif filename.lower().endswith('.docx'):
            text = self.extract_text_from_docx(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please use PDF or DOCX.")
        
        if text.startswith("Error"):
            raise HTTPException(status_code=400, detail=text)
        
        return await self.analyze_resume_comprehensive(text, job_description, filename, file_content)

# Initialize analyzer
analyzer = AdvancedATSAnalyzer()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Advanced ATS Resume Score Analyzer with Coding Profiles",
        "version": "6.0.0",
        "current_model": analyzer.model_name or "Advanced Rule-Based Analysis",
        "ollama_status": "connected" if analyzer.model_name else "using_advanced_rules",
        "features": [
            "Real NLP-based analysis",
            "Advanced keyword matching",
            "Grammar and spelling checks",
            "Content quality assessment",
            "ATS compatibility scoring",
            "Job description alignment",
            "Coding profiles analysis (LeetCode, Codeforces, CodeChef)",
            "Technical interview readiness assessment"
        ],
        "endpoints": {
            "/analyze": "POST - Upload resume file (includes coding profile analysis)",
            "/analyze-text": "POST - Analyze text input",
            "/analyze-coding-profile": "POST - Analyze specific coding profile",
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
            "analyzer_version": "6.0.0",
            "nlp_engine": "spaCy + NLTK" if analyzer.nlp else "NLTK only",
            "llm_available": analyzer.model_name is not None,
            "current_model": analyzer.model_name or "Rule-based",
            "coding_analysis": "Enabled - LeetCode, Codeforces, CodeChef"
        },
        "analysis_capabilities": {
            "file_formats": ["PDF", "DOCX", "Text"],
            "languages": ["English"],
            "max_file_size": "10MB",
            "batch_processing": True,
            "real_time_analysis": True,
            "coding_profiles": True,
            "url_extraction": True
        },
        "scoring_categories": {
            "ATS Compatibility": "File format, parsing, sections",
            "Keyword Optimization": "Job matching, industry terms",
            "Content Quality": "Action verbs, metrics, achievements",
            "Grammar & Spelling": "Language correctness, consistency",
            "Structure & Completeness": "Organization, required sections",
            "Coding Profiles": "Platform analysis, problem-solving skills, technical readiness"
        },
        "coding_platforms_supported": {
            "leetcode": "Problems solved, difficulty distribution, ranking",
            "codeforces": "Rating, contests, problem-solving record",
            "codechef": "Star rating, contests, global ranking"
        },
        "job_readiness_levels": [
            "Excellent - Ready for Senior Roles",
            "Good - Ready for Mid-Level Roles", 
            "Fair - Suitable for Junior Roles",
            "Basic - Needs Improvement for Technical Roles",
            "Insufficient - Significant Practice Required"
        ]
    }

@app.post("/analyze-coding-profile")
async def analyze_specific_coding_profile(
    platform: str = Form(...),
    username: str = Form(...)
):
    """Analyze a specific coding profile"""
    try:
        if platform.lower() not in ['leetcode', 'codeforces', 'codechef']:
            raise HTTPException(status_code=400, detail="Supported platforms: leetcode, codeforces, codechef")
        
        profile = {
            'platform': platform.lower(),
            'username': username,
            'url': f"https://{platform.lower()}.com/{username}"
        }
        
        result = await analyzer.analyze_coding_profiles([profile])
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Coding profile analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/extract-coding-profiles")
async def extract_coding_profiles_from_resume(
    resume: UploadFile = File(...)
):
    """Extract coding profiles from resume without full analysis"""
    try:
        if not resume.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        file_content = await resume.read()
        
        # Extract text
        if resume.filename.lower().endswith('.pdf'):
            text = analyzer.extract_text_from_pdf(file_content)
            urls = analyzer.extract_urls_from_pdf(file_content)
        elif resume.filename.lower().endswith('.docx'):
            text = analyzer.extract_text_from_docx(file_content)
            urls = []  # DOCX URL extraction is more complex
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Extract coding profiles
        profiles_from_text = analyzer.extract_coding_profiles_from_text(text)
        profiles_from_urls = []
        
        for url in urls:
            url_profiles = analyzer.extract_coding_profiles_from_text(url)
            profiles_from_urls.extend(url_profiles)
        
        # Combine and deduplicate
        all_profiles = profiles_from_text + profiles_from_urls
        unique_profiles = []
        seen = set()
        for profile in all_profiles:
            key = (profile['platform'], profile['username'].lower())
            if key not in seen:
                seen.add(key)
                unique_profiles.append(profile)
        
        return {
            "found_profiles": unique_profiles,
            "total_count": len(unique_profiles),
            "extraction_timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@app.get("/coding-requirements/{job_role}")
async def get_coding_requirements(job_role: str):
    """Get coding requirements for specific job roles"""
    job_role_lower = job_role.lower().replace(' ', '_').replace('-', '_')
    
    if job_role_lower in analyzer.job_coding_requirements:
        requirements = analyzer.job_coding_requirements[job_role_lower]
        return {
            "job_role": job_role,
            "requirements": requirements,
            "platforms_recommended": ["leetcode", "codeforces", "codechef"],
            "tips": [
                f"Solve at least {requirements['min_problems']} problems across all platforms",
                f"Achieve minimum rating of {requirements['min_rating']} on at least one platform",
                f"Maintain consistent practice for {requirements['consistency_months']} months",
                "Participate in weekly contests to improve problem-solving speed",
                "Focus on data structures and algorithms relevant to the role"
            ]
        }
    else:
        available_roles = list(analyzer.job_coding_requirements.keys())
        return {
            "error": f"Job role '{job_role}' not found",
            "available_roles": available_roles,
            "general_advice": {
                "min_problems": 150,
                "min_rating": 1400,
                "consistency_months": 6,
                "recommended_platforms": ["leetcode", "codeforces", "codechef"]
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
    
    print("🚀 Starting Advanced ATS Resume Analyzer with Coding Profiles...")
    print(f"📊 Analysis method: {'LLM Enhanced' if analyzer.model_name else 'Advanced Rule-Based'}")
    print(f"🧠 NLP Ready: {'Yes' if analyzer.nlp else 'Limited'}")
    print("🔧 Features: Real analysis methods, comprehensive scoring, batch processing")
    print("�‍💻 NEW: Coding profiles analysis (LeetCode, Codeforces, CodeChef)")
    print("🎯 NEW: Technical interview readiness assessment")
    print("📈 Endpoints: /batch-analyze, /compare, /analytics, /keywords/{industry}")
    print("💻 NEW Endpoints: /analyze-coding-profile, /extract-coding-profiles, /coding-requirements/{role}")
    
    # Install required packages reminder
    print("\n📦 Required packages:")
    print("pip install fastapi uvicorn python-docx PyPDF2 spacy nltk scikit-learn numpy")
    print("pip install aiohttp beautifulsoup4 PyMuPDF")  # New dependencies
    print("python -m spacy download en_core_web_sm")
    
    print("\n🌐 Server starting on port 8001...")
    
    uvicorn.run(
        "ats2:app",  # Updated filename
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )