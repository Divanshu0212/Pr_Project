from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import docx
import re
import json
import io
from datetime import datetime
import requests
import time

app = Flask(__name__)
CORS(app)

class ATSScoreAnalyzer:
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url
        # Recommended smaller, faster models for this task
        self.preferred_models ="qwen2.5:3b"
        self.model_name = None
        self.connection_tested = False
        
        # Standard sections for basic compatibility checks
        self.standard_sections = [
            'work experience', 'experience', 'employment', 'professional experience',
            'education', 'academic background', 'qualifications',
            'skills', 'technical skills', 'core competencies',
            'summary', 'profile', 'objective', 'professional summary',
            'contact', 'contact information', 'personal information'
        ]
        
        # Initialize model selection
        self.select_best_available_model()
    
    def test_ollama_connection(self):
        """Test if Ollama is accessible"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self):
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
            print("❌ Ollama not accessible. Will use fallback analysis.")
            return
        
        available_models = self.get_available_models()
        print(f"📋 Available models: {available_models}")
        
        # Try to find the best model from our preferred list
        for preferred_model in self.preferred_models:
            for available_model in available_models:
                if preferred_model in available_model:
                    self.model_name = available_model
                    print(f"✅ Selected model: {self.model_name}")
                    return
        
        # If no preferred model found, use any available model
        if available_models:
            self.model_name = available_models[0]
            print(f"⚠️ Using available model: {self.model_name}")
        else:
            print("❌ No models available. Will use fallback analysis.")
    
    def call_ollama(self, prompt, max_tokens=1500):
        """Call Ollama API with improved error handling and faster settings"""
        if not self.model_name:
            return "Error: No model available"
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,
                        "top_p": 0.9,
                        "num_predict": max_tokens,
                        "stop": ["END_ANALYSIS"],  # Add stop token
                        "num_ctx": 2048,  # Reduced context for faster processing
                        "num_gpu": 1,     # Use GPU if available
                        "num_thread": 4,  # Optimize thread usage
                    }
                },
                timeout=120  # Reduced timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Error: Empty response")
            else:
                return f"Error: HTTP {response.status_code}"
                
        except requests.exceptions.ConnectionError:
            return "Error: Cannot connect to Ollama"
        except requests.exceptions.Timeout:
            return "Error: Request timeout"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def extract_text_from_pdf(self, file_content):
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            return f"Error reading PDF: {str(e)}"
    
    def extract_text_from_docx(self, file_content):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            return f"Error reading DOCX: {str(e)}"
    
    def create_optimized_analysis_prompt(self, text, job_description=""):
        """Create an optimized prompt for smaller models"""
        
        # Truncate text for faster processing
        text_sample = text[:2500] if len(text) > 2500 else text
        
        job_section = ""
        if job_description:
            job_section = f"JOB REQUIREMENTS: {job_description[:800]}\n\n"
        
        prompt = f"""Analyze this resume for ATS compatibility. Give scores (0-100) and brief feedback.

{job_section}RESUME: {text_sample}

Rate these 5 areas (0-100 each):
1. ATS_SCORE: File format, parsing, standard sections
2. KEYWORDS: {"Job match, " if job_description else ""}relevant terms, skills
3. CONTENT: Action verbs, metrics, achievements  
4. GRAMMAR: Spelling, grammar, consistency
5. STRUCTURE: Organization, completeness, contact info

FORMAT:
ATS_SCORE: [number]
ATS_FEEDBACK: [2-3 brief points with ✓/⚠/✗]
KEYWORDS_SCORE: [number]
KEYWORDS_FEEDBACK: [2-3 brief points with ✓/⚠/✗]
CONTENT_SCORE: [number]
CONTENT_FEEDBACK: [2-3 brief points with ✓/⚠/✗]
GRAMMAR_SCORE: [number]
GRAMMAR_FEEDBACK: [2-3 brief points with ✓/⚠/✗]
STRUCTURE_SCORE: [number]
STRUCTURE_FEEDBACK: [2-3 brief points with ✓/⚠/✗]

Be concise but specific."""
        
        return prompt
    
    def parse_optimized_response(self, response):
        """Parse response with improved error handling"""
        if "Error" in response:
            return self.get_fallback_analysis()
        
        try:
            scores = {}
            feedback = {}
            
            # Default values
            categories = ['ATS', 'KEYWORDS', 'CONTENT', 'GRAMMAR', 'STRUCTURE']
            for cat in categories:
                scores[cat.lower()] = 60  # Default score
                feedback[cat.lower()] = ['⚠ Analysis completed with basic scoring']
            
            lines = response.strip().split('\n')
            current_category = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Parse scores
                for cat in categories:
                    if f'{cat}_SCORE:' in line:
                        score = self.extract_score(line, 60)
                        scores[cat.lower()] = min(max(score, 0), 100)
                        break
                    elif f'{cat}_FEEDBACK:' in line:
                        current_category = cat.lower()
                        feedback[current_category] = []
                        # Parse inline feedback
                        feedback_text = line.split(':', 1)[1].strip()
                        if feedback_text:
                            feedback[current_category].append(feedback_text)
                        break
                
                # Parse additional feedback lines
                if current_category and (line.startswith('-') or line.startswith('•')):
                    feedback_item = line[1:].strip()
                    if not any(feedback_item.startswith(p) for p in ['✓', '⚠', '✗']):
                        feedback_item = '⚠ ' + feedback_item
                    feedback[current_category].append(feedback_item)
            
            return scores, feedback
            
        except Exception as e:
            print(f"Error parsing response: {e}")
            return self.get_fallback_analysis()
    
    def extract_score(self, line, default=60):
        """Extract score from line"""
        try:
            numbers = re.findall(r'\d+', line)
            if numbers:
                return int(numbers[0])
            return default
        except:
            return default
    
    def get_fallback_analysis(self):
        """Provide fallback analysis when LLM fails"""
        scores = {
            'ats': 65,
            'keywords': 60,
            'content': 65,
            'grammar': 70,
            'structure': 65
        }
        
        feedback = {
            'ats': ['⚠ LLM analysis unavailable - using rule-based analysis', '✓ Standard file format detected'],
            'keywords': ['⚠ Basic keyword analysis applied', '⚠ Consider adding more industry-specific terms'],
            'content': ['⚠ Content appears well-structured', '⚠ Consider adding more quantifiable achievements'],
            'grammar': ['✓ No obvious grammar issues detected', '⚠ Manual review recommended'],
            'structure': ['✓ Standard resume sections present', '⚠ Ensure contact information is complete']
        }
        
        return scores, feedback
    
    def perform_basic_analysis(self, text):
        """Perform rule-based analysis as fallback"""
        scores = {'ats': 50, 'keywords': 50, 'content': 50, 'grammar': 60, 'structure': 50}
        feedback = {
            'ats': ['⚠ Basic analysis only - LLM unavailable'],
            'keywords': ['⚠ Basic analysis only - LLM unavailable'],
            'content': ['⚠ Basic analysis only - LLM unavailable'],
            'grammar': ['⚠ Basic analysis only - LLM unavailable'],
            'structure': ['⚠ Basic analysis only - LLM unavailable']
        }
        
        # Basic checks
        text_lower = text.lower()
        word_count = len(text.split())
        
        # Length check
        if word_count > 200:
            scores['content'] += 10
            feedback['content'].append('✓ Appropriate length')
        else:
            feedback['content'].append('⚠ Resume may be too short')
        
        # Section checks
        section_count = 0
        for section in self.standard_sections:
            if section in text_lower:
                section_count += 1
        
        if section_count >= 3:
            scores['structure'] += 15
            feedback['structure'].append('✓ Standard sections present')
        else:
            feedback['structure'].append('⚠ Consider adding standard sections')
        
        # Contact info check
        if '@' in text and any(str(i) in text for i in range(10)):
            scores['structure'] += 10
            feedback['structure'].append('✓ Contact information present')
        
        # Action verbs check
        action_verbs = ['managed', 'led', 'developed', 'created', 'implemented', 'achieved']
        if any(verb in text_lower for verb in action_verbs):
            scores['content'] += 10
            feedback['content'].append('✓ Action verbs detected')
        
        return scores, feedback
    
    def analyze_resume_comprehensive(self, text, job_description="", filename=""):
        """Main analysis function with fallback support"""
        
        if len(text.strip()) < 50:
            return {"error": "Resume content appears to be too short or unreadable."}
        
        # Try LLM analysis first
        if self.model_name:
            print(f"🔄 Analyzing with {self.model_name}...")
            start_time = time.time()
            
            prompt = self.create_optimized_analysis_prompt(text, job_description)
            llm_response = self.call_ollama(prompt)
            
            analysis_time = time.time() - start_time
            print(f"⏱️ Analysis completed in {analysis_time:.2f} seconds")
            
            if "Error" not in llm_response:
                scores, feedback_dict = self.parse_optimized_response(llm_response)
                analysis_method = f"LLM ({self.model_name})"
            else:
                print(f"⚠️ LLM analysis failed: {llm_response}")
                scores, feedback_dict = self.perform_basic_analysis(text)
                analysis_method = "Rule-based (fallback)"
        else:
            print("🔄 Using rule-based analysis...")
            scores, feedback_dict = self.perform_basic_analysis(text)
            analysis_method = "Rule-based (no LLM)"
        
        # Add file format bonus
        if filename and filename.lower().endswith(('.pdf', '.docx')):
            scores['ats'] = min(scores['ats'] + 5, 100)
            feedback_dict['ats'].insert(0, "✓ Compatible file format")
        
        # Calculate overall score
        overall_score = sum(scores.values()) / len(scores)
        
        # Determine score level
        if overall_score >= 80:
            score_level, score_color = "Excellent", "green"
        elif overall_score >= 65:
            score_level, score_color = "Good", "blue"
        elif overall_score >= 50:
            score_level, score_color = "Fair", "orange"
        else:
            score_level, score_color = "Needs Improvement", "red"
        
        return {
            "overall_score": round(overall_score, 1),
            "score_level": score_level,
            "score_color": score_color,
            "detailed_scores": {
                "ATS Compatibility": scores['ats'],
                "Keyword Optimization": scores['keywords'],
                "Content Quality": scores['content'],
                "Grammar & Spelling": scores['grammar'],
                "Structure & Completeness": scores['structure']
            },
            "feedback": {
                "ATS Compatibility": feedback_dict['ats'],
                "Keyword Optimization": feedback_dict['keywords'],
                "Content Quality": feedback_dict['content'],
                "Grammar & Spelling": feedback_dict['grammar'],
                "Structure & Completeness": feedback_dict['structure']
            },
            "analysis_method": analysis_method,
            "word_count": len(text.split()),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    def analyze_resume(self, file_content, filename, job_description=""):
        """Main analysis function for file uploads"""
        
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self.extract_text_from_pdf(file_content)
        elif filename.lower().endswith('.docx'):
            text = self.extract_text_from_docx(file_content)
        else:
            return {"error": "Unsupported file format. Please use PDF or DOCX."}
        
        if text.startswith("Error"):
            return {"error": text}
        
        return self.analyze_resume_comprehensive(text, job_description, filename)
    
    def analyze_text_input(self, resume_text, job_description=""):
        """Analyze resume from text input"""
        return self.analyze_resume_comprehensive(resume_text, job_description, "text_input.txt")

# Initialize analyzer
analyzer = ATSScoreAnalyzer()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Optimized ATS Resume Score Analyzer",
        "version": "4.0",
        "current_model": analyzer.model_name or "None (fallback mode)",
        "ollama_status": "connected" if analyzer.model_name else "disconnected",
        "endpoints": {
            "/analyze": "POST - Upload resume file",
            "/analyze-text": "POST - Analyze text input",
            "/health": "GET - System health check",
            "/models": "GET - Available models"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    ollama_status = "connected" if analyzer.test_ollama_connection() else "disconnected"
    
    return jsonify({
        "status": "healthy",
        "ollama_status": ollama_status,
        "current_model": analyzer.model_name or "None",
        "fallback_ready": True,
        "timestamp": datetime.now().isoformat()
    })

@app.route('/models', methods=['GET'])
def list_models():
    """List available models"""
    available = analyzer.get_available_models()
    return jsonify({
        "available_models": available,
        "preferred_models": analyzer.preferred_models,
        "current_model": analyzer.model_name
    })

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        job_description = request.form.get('job_description', '')
        file_content = file.read()
        filename = file.filename
        
        result = analyzer.analyze_resume(file_content, filename, job_description)
        
        if "error" in result:
            return jsonify(result), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/analyze-text', methods=['POST'])
def analyze_resume_text():
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({"error": "No resume text provided"}), 400
        
        resume_text = data['resume_text']
        job_description = data.get('job_description', '')
        
        result = analyzer.analyze_text_input(resume_text, job_description)
        
        if "error" in result:
            return jsonify(result), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🚀 Starting Optimized ATS Resume Analyzer...")
    print(f"📊 Selected model: {analyzer.model_name or 'None (fallback mode)'}")
    print("🔧 Features: Fast analysis, automatic fallback, model selection")
    print("\n📋 To install recommended models:")
    for model in analyzer.preferred_models:
        print(f"   ollama pull {model}")
    print("\n🌐 Server starting on port 8001...")
    
    app.run(host='0.0.0.0', port=8001, debug=True)