# Divanshu Bhargava Resume Data - CORRECTED
sss = {
    "personal_info": {
        "name": "Divanshu Bhargava",  # Fixed: removed extra 'a'
        "email": "divanshubhargava026@gmail.com",
        "phone": "+91-9359992426",
        "location": "Jabalpur, India",
        "github": "github.com/divanshu0212",
        "linkedin": "linkedin.com/in/divanshu-bhargava"
    },
    "work_experience": [
        {
            "company": "Self-Employed (Freelance)",
            "position": "Full Stack Developer",
            "start_date": "2024-01",
            "end_date": None,
            "location": "Remote",
            "responsibilities": [
                "Developed full-stack web applications using MERN stack with modern frameworks",
                "Collaborated with multiple clients to deliver custom software solutions",
                "Implemented AI-powered features using machine learning models",
                "Built scalable applications with JWT authentication and high uptime requirements",
                "Managed project timelines and client communication for multiple concurrent projects"
            ],
            "achievements": [
                "Developed 3+ full-stack web applications serving 500+ users, resulting in 40% improvement in client engagement and 25% increase in conversion rates",
                "Built scalable MERN stack applications with JWT authentication supporting 2,000+ concurrent users and 99.9% uptime",
                "Implemented AI-powered features using machine learning models, achieving 92% accuracy in prediction tasks and reducing processing time by 60%",  # Fixed: typo
                "Collaborated with 5+ clients to deliver custom solutions within tight deadlines, maintaining 100% client satisfaction rate"
            ]
        }
    ],
    "education": [
        {
            "institution": "Indian Institute Of Information Technology Jabalpur",
            "degree": "Bachelor of Technology",
            "field_of_study": "Computer Science and Engineering",
            "graduation_date": "2027-05",
            "gpa": "8.1",
            },
        {
            "institution": "KRSD Public School",
            "degree": "CBSE Class XII",  # Fixed: typo
            "field_of_study": "Science",
            "graduation_date": "2022-06",
            "gpa": "94.2%",
            "relevant_coursework": []
        },
        {
            "institution": "Rajiv International School",
            "degree": "CBSE Class X",  # Fixed: typo
            "field_of_study": "General",
            "graduation_date": "2020-05",
            "gpa": "93.6%",
            "relevant_coursework": []
        }
    ],
    "skills": {
        "Programming Languages": ["Python", "JavaScript", "TypeScript", "C++", "Java", "SQL", "HTML5", "CSS3"],  # Fixed: typo
        "Frontend Technologies": ["React.js", "Next.js", "Redux", "Vue.js", "Tailwind CSS", "Bootstrap"],  # Fixed: typo
        "Backend Technologies": ["Node.js", "Express.js", "Django", "Django REST Framework"],  # Fixed: typo
        "Databases": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
        "Tools & DevOps": ["Git", "Docker", "AWS", "Linux", "RESTful APIs", "JWT", "Postman"],
        "Machine Learning": ["Scikit-learn", "NumPy", "Pandas", "Matplotlib", "TensorFlow", "BERT", "VisionTransformer"],
        "Core Concepts": ["Data Structures & Algorithms", "Object-Oriented Programming", "Database Management", "Operating Systems"]
    },
    "projects": [
        {
            "name": "BigDocs - Healthcare Management System",
            "description": "Comprehensive healthcare platform with telemedicine, appointment scheduling, and AI-powered disease prediction across 7 core modules",  # Fixed: typo
            "technologies": ["MERN Stack", "Machine Learning", "BERT", "AI/ML", "Healthcare APIs"],
            "achievements": [
                "Architected platform serving 1,000+ users with comprehensive healthcare functionalities",
                "Developed custom BERT-based ML model achieving 92% accuracy in disease prediction across 100+ conditions, reducing diagnosis time from 30 minutes to 3 seconds",  # Fixed: typo
                "Implemented real-time appointment system supporting 50+ concurrent bookings, decreasing scheduling time by 75% and improving patient satisfaction by 60%",
                "Built secure telemedicine infrastructure with HD video quality and integrated prescription management processing 1,000+ daily medical records"  # Fixed: typo
            ],
            "url": "github.com/divanshu0212/bigdocs"
        },
        {
            "name": "InternFlow - Professional Networking Platform",  # Fixed: typo
            "description": "Career platform combining LinkedIn and job portal functionalities with intelligent matching algorithms",
            "technologies": ["MERN Stack", "JWT", "Natural Language Processing", "Machine Learning"],  # Fixed: typo
            "achievements": [
                "Engineered platform connecting 10,000+ students with 500+ companies through intelligent matching algorithms",
                "Built advanced skill-based filtering system processing 25+ resume parameters against 1,000+ job postings, achieving 94% accuracy in candidate-role matching",  # Fixed: typo
                "Developed automated resume parsing system generating 70+ detailed candidate profiles weekly, reducing recruiter screening time by 65%",
                "Created comprehensive company dashboard managing 200+ job postings and 150+ internship opportunities with real-time analytics tracking 12 key performance metrics"
            ],
            "url": "github.com/divanshu0212/internflow"
        },
        {
            "name": "Plant Z - AI Plant Healthcare Platform",
            "description": "Full-stack plant healthcare platform with AI-powered disease detection and personalized care recommendations",
            "technologies": ["MERN Stack", "Gemini API", "VisionTransformer", "AI/ML", "Computer Vision"],
            "achievements": [
                "Developed platform achieving 86% accuracy in plant disease detection through VisionTransformer ML model",
                "Implemented personalized plant care system with multilingual support and automated scheduling, reducing user plant mortality rate by 45%",
                "Built community platform with AI content moderation serving 500+ plant enthusiasts, facilitating knowledge sharing and peer-to-peer learning"
            ],
            "url": "github.com/divanshu0212/plantz"
        }
    ],
    "certifications": [
        "HackByte 3.0 Winner - Top 8 position among 120 elite teams",
        "JEE Main 2023 - 98.83 percentile (AIR 13,679)"
    ],
    "languages": ["English", "Hindi"],
    "additional_info": {
        "coding_profiles": {
            "LeetCode": "divanshu0212 - 175+ problems solved",
            "CodeChef": "divanshu0212 - 100+ problems solved", 
            "Codeforces": "divanshu0212 - 100+ problems solved"
        }
    }
}

# Sample usage with the resume maker backend
if __name__ == "__main__":
    import requests
    import json
    
    # Sample job description for a Full Stack Developer position
    job_description = """
    We are seeking a talented Full Stack Developer to join our growing team.
    
    Requirements:
    - Bachelor's degree in Computer Science or related field
    - 2+ years of experience in full-stack web development
    - Proficiency in JavaScript, React.js, Node.js, and Express.js
    - Experience with MongoDB, PostgreSQL, or other databases
    - Knowledge of RESTful APIs and JWT authentication
    - Experience with AI/ML integration is a plus
    - Strong problem-solving skills and competitive programming background
    - Experience with healthcare or fintech applications preferred
    - Knowledge of Docker, AWS, and cloud deployment
    - Excellent communication and teamwork skills
    
    Responsibilities:
    - Develop and maintain full-stack web applications
    - Collaborate with cross-functional teams to deliver high-quality software
    - Implement AI-powered features and machine learning models
    - Optimize application performance and scalability
    - Participate in code reviews and maintain code quality standards
    - Work on healthcare technology solutions
    - Mentor junior developers and contribute to technical documentation
    """
    
    # Prepare request payload
    request_payload = {
        "resume_data": sss,
        "job_description": job_description,
        "resume_format": "professional"  # Fixed: typo
    }
    
    # Test the resume generation
    try:
        print("Generating optimized resume for Divanshu Bhargava...")
        response = requests.post(
            "http://localhost:8000/api/generate-resume", 
            json=request_payload,
            timeout=800
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Resume generated successfully!")  # Fixed: typo
            print(f"Overall Score: {result['score']}/100")
            print(f"Resume ID: {result['resume_id']}")
            
            print(f"\nDetailed Scores:")
            feedback = result['feedback']
            print(f"- Impact Score: {feedback['impact_score']}/100")
            print(f"- Keyword Score: {feedback['keyword_score']}/100")
            print(f"- Formatting Score: {feedback['formatting_score']}/100")
            print(f"- Brevity Score: {feedback['brevity_score']}/100")
            
            if result['suggestions']:
                print(f"\nSuggestions for improvement:")
                for i, suggestion in enumerate(result['suggestions'], 1):
                    print(f"{i}. {suggestion}")
            
            print(f"\nOptimized Resume:")
            print("=" * 60)
            print(result['optimized_resume'])
            
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("Make sure the backend is running on http://localhost:8000")
    
    # Just print the formatted data for now
    print("📄 Divanshu Bhargava Resume Data:")
    print("=" * 50)
    print(json.dumps(sss, indent=2))