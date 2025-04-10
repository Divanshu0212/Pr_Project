
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
import google.generativeai as genai
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import string

app = Flask(__name__)
CORS(app)

# Configure environment variables
# In production, use proper environment variable management
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"  # Replace with your actual API key
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Download NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def extract_text_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def extract_text(file_path):
    extension = file_path.rsplit(".", 1)[1].lower()
    if extension == "pdf":
        return extract_text_from_pdf(file_path)
    elif extension == "docx":
        return extract_text_from_docx(file_path)
    elif extension == "txt":
        return extract_text_from_txt(file_path)
    return ""

def get_keywords_for_profession(profession):
    """Get relevant keywords for the given profession using Gemini API"""
    model = genai.GenerativeModel('gemini-pro')
    prompt = f"""
    Generate a comprehensive list of relevant ATS keywords for the profession: {profession}.
    
    Format your response as a JSON array with the following structure:
    {{
        "technical_skills": ["keyword1", "keyword2", ...],
        "soft_skills": ["keyword1", "keyword2", ...],
        "certifications": ["cert1", "cert2", ...],
        "experience_terms": ["term1", "term2", ...],
        "education_requirements": ["req1", "req2", ...]
    }}
    
    Include only the JSON output and no additional text.
    """
    
    response = model.generate_content(prompt)
    response_text = response.text
    
    # Extract JSON from response (handling potential markdown code blocks)
    if "```json" in response_text:
        json_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        json_text = response_text.split("```")[1].strip()
    else:
        json_text = response_text.strip()
        
    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        # Fallback with generic keywords if parsing fails
        return {
            "technical_skills": ["excel", "word", "powerpoint"],
            "soft_skills": ["communication", "teamwork", "leadership"],
            "certifications": ["certification", "degree"],
            "experience_terms": ["years of experience", "managed", "led"],
            "education_requirements": ["bachelor", "master", "phd"]
        }

def calculate_keyword_score(resume_text, keywords_data):
    """Calculate score based on keywords presence (40% of total)"""
    # Flatten all keywords into one list
    all_keywords = []
    for category in keywords_data.values():
        all_keywords.extend(category)
    
    # Preprocess resume text
    resume_lower = resume_text.lower()
    tokens = word_tokenize(resume_lower)
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words and word not in string.punctuation]
    
    # Count keywords found
    keywords_found = sum(1 for keyword in all_keywords if keyword.lower() in resume_lower)
    
    # Calculate score (scaled to 40 points maximum)
    total_keywords = len(all_keywords)
    if total_keywords == 0:
        return 0
    
    raw_score = (keywords_found / total_keywords) * 100
    # Cap at 40 points (40% of total score)
    return min(40, raw_score)

def calculate_format_score(resume_text):
    """Calculate score based on formatting and structure (30% of total)"""
    score = 0
    max_score = 30
    
    # Check for sections (10 points)
    sections = ["experience", "education", "skills", "summary", "contact", "objective"]
    sections_found = sum(1 for section in sections if section in resume_text.lower())
    section_score = (sections_found / len(sections)) * 10
    
    # Check for bullet points (5 points)
    bullet_patterns = [r'•', r'\*', r'-\s', r'\d+\.\s']
    bullets_found = False
    for pattern in bullet_patterns:
        if re.search(pattern, resume_text):
            bullets_found = True
            break
    bullet_score = 5 if bullets_found else 0
    
    # Check for consistent formatting (5 points)
    # Look for consistent date formats
    date_patterns = [
        r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s\-]*\d{4}\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
        r'\b\d{4}\b'
    ]
    date_formats_found = sum(1 for pattern in date_patterns if re.search(pattern, resume_text))
    date_score = 5 if date_formats_found > 0 else 0
    
    # Check for appropriate length (5 points)
    word_count = len(resume_text.split())
    length_score = 5 if 300 <= word_count <= 1200 else 3 if 200 <= word_count <= 1500 else 0
    
    # Check for contact information (5 points)
    contact_patterns = [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Phone number
        r'linkedin\.com\/in\/[\w\-]+'  # LinkedIn
    ]
    contact_found = sum(1 for pattern in contact_patterns if re.search(pattern, resume_text))
    contact_score = 5 if contact_found > 0 else 0
    
    # Sum up format subscores
    format_score = section_score + bullet_score + date_score + length_score + contact_score
    
    # Scale to max_score
    return min(max_score, format_score)

def calculate_achievements_score(resume_text, keywords_data):
    """Calculate score based on quantifiable achievements (30% of total)"""
    max_score = 30
    score = 0
    
    # Check for numbers and percentages (10 points)
    number_patterns = [
        r'\b\d+%\b',  # Percentages
        r'\$\d+',     # Dollar amounts
        r'\b\d+x\b',  # Multipliers
        r'\b\d+\+?\b' # Numbers
    ]
    
    number_matches = sum(len(re.findall(pattern, resume_text)) for pattern in number_patterns)
    number_score = min(10, number_matches * 2)  # Cap at 10 points
    
    # Check for achievement verbs (10 points)
    achievement_verbs = [
        "achieved", "improved", "increased", "decreased", "reduced",
        "delivered", "generated", "saved", "implemented", "developed",
        "created", "launched", "led", "managed", "trained", "supervised"
    ]
    
    verb_matches = sum(1 for verb in achievement_verbs if verb.lower() in resume_text.lower())
    verb_score = min(10, (verb_matches / len(achievement_verbs)) * 10)
    
    # Check for experience relevance (10 points)
    experience_terms = keywords_data.get("experience_terms", [])
    experience_matches = sum(1 for term in experience_terms if term.lower() in resume_text.lower())
    experience_score = min(10, (experience_matches / max(1, len(experience_terms))) * 10)
    
    # Sum up achievement subscores
    achievement_score = number_score + verb_score + experience_score
    
    # Scale to max_score
    return min(max_score, achievement_score)

@app.route("/api/profession-keywords", methods=["POST"])
def profession_keywords():
    data = request.get_json()
    profession = data.get("profession", "")
    
    if not profession:
        return jsonify({"error": "Profession is required"}), 400
    
    try:
        keywords = get_keywords_for_profession(profession)
        return jsonify({"keywords": keywords})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Failed to fetch keywords"}), 500

@app.route("/api/analyze-resume", methods=["POST"])
def analyze_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    keywords_json = request.form.get("keywords", "{}")
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        
        try:
            # Extract text from resume
            resume_text = extract_text(file_path)
            if not resume_text.strip():
                return jsonify({"error": "Could not extract text from the file"}), 400
            
            # Parse keywords
            keywords_data = json.loads(keywords_json)
            
            # Calculate scores
            keyword_score = calculate_keyword_score(resume_text, keywords_data)
            format_score = calculate_format_score(resume_text)
            achievements_score = calculate_achievements_score(resume_text, keywords_data)
            
            total_score = keyword_score + format_score + achievements_score
            
            # Clean up the file
            os.remove(file_path)
            
            result = {
                "total_score": round(total_score, 1),
                "keyword_score": round(keyword_score, 1),
                "format_score": round(format_score, 1),
                "achievements_score": round(achievements_score, 1),
                "detailed_analysis": {
                    "keywords_found": [kw for category in keywords_data.values() for kw in category if kw.lower() in resume_text.lower()],
                    "missing_keywords": [kw for category in keywords_data.values() for kw in category if kw.lower() not in resume_text.lower()],
                }
            }
            
            return jsonify(result)
        except Exception as e:
            print(f"Error analyzing resume: {str(e)}")
            return jsonify({"error": f"Error analyzing resume: {str(e)}"}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

if __name__ == "__main__":
    app.run(debug=True)