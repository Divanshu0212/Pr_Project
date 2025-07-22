
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
nltk.download('punkt_tab')
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import string

app = Flask(__name__)
CORS(app)

# Configure environment variables
# In production, use proper environment variable management
GEMINI_API_KEY = "AIzaSyBjCoY3uemTDJdOTfFSWTb1lGoosUsvh_Y"  # Replace with your actual API key
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

def get_keywords_for_profession(profession, experience_level="mid"):
    """Get relevant keywords for the given profession and experience level using Gemini API"""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    level_description = {
        "entry": "entry-level/junior professionals with 0-2 years of experience",
        "mid": "mid-level professionals with 3-5 years of experience",
        "senior": "senior-level professionals with 6+ years of experience, leadership roles"
    }
    
    level_desc = level_description.get(experience_level.lower(), level_description["mid"])
    
    prompt = f"""
    Generate a comprehensive list of relevant ATS keywords for {level_desc} in the profession: {profession}.
    
    Customize the keywords specifically for {experience_level} level positions by:
    - For entry-level: Focus on foundational skills, education, internships, and entry certifications
    - For mid-level: Include more specialized skills, project management terms, and mid-tier certifications
    - For senior-level: Emphasize leadership, strategic skills, advanced certifications, and management terms
    
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
    print(f"Response from Gemini: {response_text}")
    
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
    # Check if keywords_data is a dictionary
    if not isinstance(keywords_data, dict):
        print(f"Warning: keywords_data is not a dictionary: {type(keywords_data)}")
        return 0, [], []
    
    # Ensure resume_text is a string
    if not isinstance(resume_text, str):
        print(f"Warning: resume_text is not a string: {type(resume_text)}")
        resume_text = str(resume_text)
    
    # Preprocess resume text - convert to lowercase and remove punctuation
    resume_lower = resume_text.lower()
    
    # Flatten all keywords into one list with de-duplication
    all_keywords = set()
    for category, keywords_list in keywords_data.items():
        if isinstance(keywords_list, list):  # Ensure it's a list before extending
            all_keywords.update([k for k in keywords_list if isinstance(k, str)])
    
    # Convert back to list
    all_keywords = list(all_keywords)
    print(f"Total unique keywords to check: {len(all_keywords)}")
    
    # Match keywords with proper word boundary checking
    keywords_found = []
    missing_keywords = []
    
    import re
    for keyword in all_keywords:
        keyword_lower = keyword.lower()
        
        # For multi-word phrases
        if ' ' in keyword_lower:
            # Create pattern that allows flexible matching with word boundaries
            words = [re.escape(word) for word in keyword_lower.split()]
            pattern = r'(?:\b' + r'\b\s+\b'.join(words) + r'\b)'
            
            # Check for exact phrase or words appearing separately
            if re.search(pattern, resume_lower) or all(re.search(r'\b' + re.escape(word) + r'\b', resume_lower) for word in keyword_lower.split()):
                keywords_found.append(keyword)
                print(f"Found keyword: '{keyword}'")
            else:
                missing_keywords.append(keyword)
        else:
            # For single words, use word boundary matching
            if re.search(r'\b' + re.escape(keyword_lower) + r'\b', resume_lower):
                keywords_found.append(keyword)
                print(f"Found keyword: '{keyword}'")
            else:
                missing_keywords.append(keyword)
    
    # Calculate score
    total_keywords = len(all_keywords)
    if total_keywords == 0:
        print("Warning: No keywords to match against")
        return 0, [], []
    
    # Calculate raw score (0-100 scale)
    found_count = len(keywords_found)
    raw_score = (found_count / total_keywords) * 100
    
    print(f"Keywords found: {found_count}/{total_keywords} = {raw_score}%")
    
    # Cap at 40 points (40% of total score)
    final_score = min(40, raw_score)
    
    return final_score, keywords_found, missing_keywords

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
    experience_terms = []
    if isinstance(keywords_data, dict) and isinstance(keywords_data.get("experience_terms", []), list):
        experience_terms = keywords_data.get("experience_terms", [])
    
    if experience_terms:
        experience_matches = sum(1 for term in experience_terms if isinstance(term, str) and term.lower() in resume_text.lower())
        experience_score = min(10, (experience_matches / len(experience_terms)) * 10)
    else:
        experience_score = 0
    
    # Sum up achievement subscores
    achievement_score = number_score + verb_score + experience_score
    
    # Scale to max_score
    return min(max_score, achievement_score)

@app.route("/api/profession-keywords", methods=["POST"])
def profession_keywords():
    data = request.get_json()
    profession = data.get("profession", "")
    experience_level = data.get("experience_level", "mid")
    
    if not profession:
        return jsonify({"error": "Profession is required"}), 400
    
    try:
        keywords = get_keywords_for_profession(profession, experience_level)
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
            
            # Parse keywords - adding error handling and validation
            try:
                keywords_data = json.loads(keywords_json)
                
                # Validate that keywords_data is a dictionary, not a list
                if isinstance(keywords_data, list):
                    # Convert the list to dictionary if it's a list
                    keywords_data = {
                        "keywords": keywords_data
                    }
                
                # Ensure all expected categories exist
                if not any(category in keywords_data for category in ["technical_skills", "soft_skills", "certifications", "experience_terms", "education_requirements"]):
                    # If none of the expected categories exist, restructure the data
                    all_keywords = []
                    if isinstance(keywords_data.get("keywords", []), list):
                        all_keywords = keywords_data.get("keywords", [])
                    elif "keywords" not in keywords_data:
                        # Flatten all values if they are lists
                        for value in keywords_data.values():
                            if isinstance(value, list):
                                all_keywords.extend(value)
                            
                    keywords_data = {
                        "technical_skills": all_keywords,
                        "soft_skills": [],
                        "certifications": [],
                        "experience_terms": [],
                        "education_requirements": []
                    }
            except Exception as e:
                print(f"Error parsing keywords: {str(e)}")
                # Fallback with empty keywords
                keywords_data = {
                    "technical_skills": [],
                    "soft_skills": [],
                    "certifications": [],
                    "experience_terms": [],
                    "education_requirements": []
                }
            
            # Calculate scores using improved keyword matching
            keyword_score, keywords_found, missing_keywords = calculate_keyword_score(resume_text, keywords_data)
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
                    "keywords_found": keywords_found,
                    "missing_keywords": missing_keywords,
                }
            }
            
            return jsonify(result)
        except Exception as e:
            print(f"Error analyzing resume: {str(e)}")
            return jsonify({"error": f"Error analyzing resume: {str(e)}"}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

if __name__ == "__main__":
    app.run(debug=True,port=5000)