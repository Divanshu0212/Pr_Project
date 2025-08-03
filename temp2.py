from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import requests
import json
import re
from datetime import datetime
import uuid
import os
import tempfile
from pathlib import Path
import weasyprint
from jinja2 import Template

# LangChain imports
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from fastapi.middleware.cors import CORSMiddleware

os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGCHAIN_API_KEY","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")
os.environ["LANGCHAIN_TRACING_V2"] = os.getenv("LANGCHAIN_TRACING_V2", "true")
os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "Resume")

app = FastAPI(title="Resume Maker API with LangChain Integration", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins like ["http://localhost:3000", "https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],  # Or specify methods like ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # Or specify headers like ["Content-Type", "Authorization"]
)
# Pydantic models
class WorkExperience(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    location: Optional[str] = None
    responsibilities: List[str]
    achievements: List[str] = []

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    graduation_date: str
    gpa: Optional[str] = None
    relevant_coursework: List[str] = []

class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]
    achievements: List[str] = []
    url: Optional[str] = None

class ResumeData(BaseModel):
    personal_info: Dict[str, str] = Field(..., description="Name, email, phone, location, etc.")
    professional_summary: Optional[str] = None
    work_experience: List[WorkExperience]
    education: List[Education]
    skills: Dict[str, List[str]] = Field(default_factory=dict, description="Categories of skills")
    projects: List[Project] = []
    certifications: List[str] = []
    languages: List[str] = []
    target_job_description: Optional[str] = None

class ResumeRequest(BaseModel):
    resume_data: ResumeData
    job_description: Optional[str] = None
    resume_format: str = "professional"

class ResumeResponse(BaseModel):
    resume_id: str
    optimized_resume: str
    score: int
    feedback: Dict[str, Any]
    suggestions: List[str]
    html_content: str
    pdf_available: bool = True

class OptimizedResumeParser:
    """Parser to extract structured data from optimized resume text"""
    
    def parse_optimized_resume(self, optimized_text: str, original_data: ResumeData) -> ResumeData:
        """Parse the optimized resume text and create a new ResumeData object"""
        try:
            # Create a copy of original data to modify
            optimized_data = ResumeData(
                personal_info=original_data.personal_info.copy(),
                work_experience=[],
                education=original_data.education.copy(),
                skills=original_data.skills.copy(),
                projects=[],
                certifications=original_data.certifications.copy(),
                languages=original_data.languages.copy()
            )
            
            # Extract professional summary
            summary_match = re.search(r'\*\*Professional Summary:\*\*\s*\n(.+?)(?=\n\*\*|\n$)', optimized_text, re.DOTALL | re.IGNORECASE)
            if summary_match:
                summary_text = summary_match.group(1).strip()
                summary_text = summary_text.strip('"').strip()
                optimized_data.professional_summary = summary_text
            
            # Extract work experience
            work_section = re.search(r'\*\*Work Experience:\*\*\s*\n(.+?)(?=\n\*\*Education|\n\*\*Technical Skills|\n$)', optimized_text, re.DOTALL | re.IGNORECASE)
            if work_section:
                optimized_data.work_experience = self._parse_work_experience(work_section.group(1))
            
            # Extract projects
            projects_section = re.search(r'\*\*Projects:\*\*\s*\n(.+?)(?=\n\*\*Certifications|\n\*\*Languages|\n$)', optimized_text, re.DOTALL | re.IGNORECASE)
            if projects_section:
                optimized_data.projects = self._parse_projects(projects_section.group(1))
            
            return optimized_data
            
        except Exception as e:
            print(f"Error parsing optimized resume: {e}")
            return original_data
    
    def _parse_work_experience(self, work_text: str) -> List[WorkExperience]:
        """Parse work experience from optimized text"""
        experiences = []
        
        # Split by job entries
        job_entries = re.split(r'\n(?=\*\*[^*]+\s+at\s+[^*]+\s+\([^)]+\)\*\*)', work_text.strip())
        
        for entry in job_entries:
            if not entry.strip():
                continue
                
            # Extract job header
            header_match = re.search(r'\*\*(.+?)\s+at\s+(.+?)\s+\((.+?)\)\*\*', entry)
            if not header_match:
                continue
                
            position = header_match.group(1).strip()
            company = header_match.group(2).strip()
            date_range = header_match.group(3).strip()
            
            # Parse date range
            if ' - ' in date_range:
                start_date, end_date = date_range.split(' - ', 1)
                end_date = None if end_date.strip().lower() == 'present' else end_date.strip()
            else:
                start_date = date_range
                end_date = None
            
            # Extract location if present
            location_match = re.search(r'Location:\s*([^\n]+)', entry)
            location = location_match.group(1).strip() if location_match else None
            
            # Extract responsibilities
            responsibilities = []
            resp_section = re.search(r'Responsibilities:\s*\n((?:• .+\n?)+)', entry, re.DOTALL)
            if resp_section:
                resp_lines = resp_section.group(1).split('\n')
                for line in resp_lines:
                    line = line.strip()
                    if line.startswith('•'):
                        clean_line = line.strip('• ').strip().strip('"').strip()
                        if clean_line:
                            responsibilities.append(clean_line)
            
            # Extract achievements
            achievements = []
            ach_section = re.search(r'Achievements:\s*\n((?:• .+\n?)+)', entry, re.DOTALL)
            if ach_section:
                ach_lines = ach_section.group(1).split('\n')
                for line in ach_lines:
                    line = line.strip()
                    if line.startswith('•'):
                        clean_line = line.strip('• ').strip().strip('"').strip()
                        if clean_line:
                            achievements.append(clean_line)
            
            experiences.append(WorkExperience(
                company=company,
                position=position,
                start_date=start_date.strip(),
                end_date=end_date,
                location=location,
                responsibilities=responsibilities,
                achievements=achievements
            ))
        
        return experiences
    
    def _parse_projects(self, projects_text: str) -> List[Project]:
        """Parse projects from optimized text"""
        projects = []
        
        # Split by project entries
        project_entries = re.split(r'\n(?=\*\*[^*]+\*\*(?:\n|$))', projects_text.strip())
        
        for entry in project_entries:
            if not entry.strip():
                continue
                
            # Extract project name
            name_match = re.search(r'\*\*([^*]+?)\*\*', entry)
            if not name_match:
                continue
                
            full_name = name_match.group(1).strip()
            
            # Check if name contains a dash
            if ' - ' in full_name:
                name, description = full_name.split(' - ', 1)
                name = name.strip()
            else:
                name = full_name
                desc_match = re.search(r'\*\*[^*]+\*\*\s*\n([^\n]+)', entry)
                description = desc_match.group(1).strip() if desc_match else ""
            
            # Extract technologies
            technologies = []
            tech_match = re.search(r'Technologies:\s*([^\n]+)', entry)
            if tech_match:
                tech_text = tech_match.group(1).strip()
                technologies = [tech.strip() for tech in tech_text.split(',')]
            
            # Extract achievements
            achievements = []
            ach_section = re.search(r'Achievements:\s*\n((?:• .+\n?)+)', entry, re.DOTALL)
            if ach_section:
                ach_lines = ach_section.group(1).split('\n')
                for line in ach_lines:
                    line = line.strip()
                    if line.startswith('•'):
                        clean_line = line.strip('• ').strip().strip('"').strip()
                        if clean_line:
                            achievements.append(clean_line)
            
            # Extract URL
            url_match = re.search(r'URL:\s*([^\n]+)', entry)
            url = url_match.group(1).strip() if url_match else None
            
            projects.append(Project(
                name=name,
                description=description,
                technologies=technologies,
                achievements=achievements,
                url=url
            ))
        
        return projects

class HTMLResumeGenerator:
    """Generator for HTML and PDF resumes"""
    def __init__(self):
        self.template_dir = "html_templates"
        self.ensure_template_dir()
        self.parser = OptimizedResumeParser()
        
    def ensure_template_dir(self):
        """Ensure template directory exists"""
        if not os.path.exists(self.template_dir):
            os.makedirs(self.template_dir)
    
    def generate_resume_html(self, original_resume_data: ResumeData, optimized_content: str, 
                        analysis: Dict[str, Any], resume_id: str) -> str:
        """Generate HTML resume using optimized content"""
        
        # Parse optimized content into structured data
        optimized_resume_data = self.parser.parse_optimized_resume(optimized_content, original_resume_data)
        
        template = self._get_html_template()
        
        # Prepare template variables using optimized data
        template_vars = {
            'personal_info': optimized_resume_data.personal_info,
            'professional_summary': optimized_resume_data.professional_summary,
            'work_experience': optimized_resume_data.work_experience,
            'education': optimized_resume_data.education,
            'skills': optimized_resume_data.skills,
            'projects': optimized_resume_data.projects,
            'certifications': optimized_resume_data.certifications,
            'languages': optimized_resume_data.languages,
            'analysis': analysis,
            'resume_id': resume_id,
            'optimized_content': optimized_content
        }
        
        # Render template
        jinja_template = Template(template)
        html_content = jinja_template.render(**template_vars)
        
        return html_content
    
    def generate_resume_pdf(self, html_content: str, resume_id: str) -> str:
        """Generate PDF from HTML using WeasyPrint"""
        try:
            # Create temporary file for PDF
            temp_dir = tempfile.gettempdir()
            pdf_filename = f"resume_{resume_id}.pdf"
            pdf_path = os.path.join(temp_dir, pdf_filename)
            
            # Generate PDF
            weasyprint.HTML(string=html_content).write_pdf(pdf_path)
            
            return pdf_path
        except Exception as e:
            print(f"PDF generation failed: {e}")
            return None
    
    def _get_html_template(self) -> str:
        """Get professional HTML template with clean, traditional formatting"""
        return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{ personal_info.name or personal_info.Name }} - Resume</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.5;
                color: #000;
                max-width: 210mm;
                margin: 0 auto;
                padding: 25mm;
                background: #fff;
                font-size: 12px;
            }
            
            .header {
                text-align: center;
                padding-bottom: 15px;
                border-bottom: 1px solid #000;
                margin-bottom: 20px;
            }
            
            .name {
                font-size: 20px;
                font-weight: bold;
                color: #000;
                margin-bottom: 8px;
                letter-spacing: 1px;
            }
            
            .contact-info {
                font-size: 11px;
                color: #000;
                line-height: 1.3;
            }
            
            .contact-info span {
                display: inline-block;
                margin: 0 8px;
            }
            
            .contact-info span:not(:last-child):after {
                content: " |";
                margin-left: 8px;
            }
            
            .section {
                margin-bottom: 18px;
            }
            
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #000;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #000;
                padding-bottom: 2px;
                margin-bottom: 10px;
            }
            
            .summary {
                text-align: justify;
                line-height: 1.4;
                color: #000;
                margin-bottom: 5px;
            }
            
            .experience-item, .education-item, .project-item {
                margin-bottom: 15px;
            }
            
            .item-header {
                margin-bottom: 5px;
            }
            
            .item-title {
                font-weight: bold;
                font-size: 13px;
                color: #000;
                display: inline;
            }
            
            .item-subtitle {
                color: #000;
                font-size: 12px;
                font-style: italic;
                display: inline;
                margin-left: 10px;
            }
            
            .item-date {
                color: #000;
                font-size: 11px;
                float: right;
                font-weight: normal;
            }
            
            .clear {
                clear: both;
            }
            
            .bullet-points {
                margin-top: 5px;
                margin-left: 20px;
            }
            
            .bullet-point {
                margin-bottom: 3px;
                text-align: justify;
                line-height: 1.4;
                list-style-type: disc;
                display: list-item;
            }
            
            .bullet-points strong {
                font-weight: bold;
                margin-bottom: 3px;
                display: block;
                margin-left: -20px;
            }
            
            .skills-grid {
                line-height: 1.4;
            }
            
            .skill-category {
                margin-bottom: 8px;
            }
            
            .skill-category h4 {
                font-weight: bold;
                font-size: 12px;
                color: #000;
                display: inline;
                margin-right: 10px;
            }
            
            .skill-tags {
                display: inline;
            }
            
            .skill-tag {
                font-size: 12px;
                color: #000;
            }
            
            .skill-tag:not(:last-child):after {
                content: ", ";
            }
            
            .project-tech {
                font-size: 11px;
                color: #000;
                margin-top: 3px;
                font-style: italic;
            }
            
            .tech-tag {
                font-size: 11px;
                color: #000;
            }
            
            .tech-tag:not(:last-child):after {
                content: ", ";
            }
            
            .certifications {
                list-style-type: none;
                margin-left: 0;
            }
            
            .certification-item {
                margin-bottom: 3px;
                position: relative;
                padding-left: 15px;
            }
            
            .certification-item:before {
                content: "•";
                position: absolute;
                left: 0;
            }
            
            .languages-list {
                line-height: 1.4;
            }
            
            @media print {
                body {
                    font-size: 11px;
                    padding: 20mm;
                }
                
                .name {
                    font-size: 18px;
                }
                
                .section-title {
                    font-size: 13px;
                }
                
                .item-title {
                    font-size: 12px;
                }
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <div class="name">{{ personal_info.name or personal_info.Name }}</div>
            <div class="contact-info">
                {% if personal_info.email or personal_info.Email %}<span>{{ personal_info.email or personal_info.Email }}</span>{% endif %}
                {% if personal_info.phone or personal_info.Phone %}<span>{{ personal_info.phone or personal_info.Phone }}</span>{% endif %}
                {% if personal_info.location or personal_info.Location %}<span>{{ personal_info.location or personal_info.Location }}</span>{% endif %}
                {% if personal_info.linkedin or personal_info.Linkedin %}<span>{{ personal_info.linkedin or personal_info.Linkedin }}</span>{% endif %}
                {% if personal_info.github or personal_info.Github %}<span>{{ personal_info.github or personal_info.Github }}</span>{% endif %}
            </div>
        </div>

        <!-- Professional Summary -->
        {% if professional_summary %}
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary">{{ professional_summary }}</div>
        </div>
        {% endif %}

        <!-- Work Experience -->
        {% if work_experience %}
        <div class="section">
            <div class="section-title">Achievements</div>
            {% for exp in work_experience %}
            <div class="experience-item">
                {% if exp.achievements %}
                <div class="bullet-points">
                    {% for ach in exp.achievements %}
                    <li class="bullet-point">{{ ach }}</li>
                    {% endfor %}
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </div>
        {% endif %}

        <!-- Education -->
        {% if education %}
        <div class="section">
            <div class="section-title">Education</div>
            {% for edu in education %}
            <div class="education-item">
                <div class="item-header">
                    <span class="item-title">{{ edu.degree }} in {{ edu.field_of_study }}</span>
                    <span class="item-subtitle">{{ edu.institution }}</span>
                    <span class="item-date">{{ edu.graduation_date }}</span>
                    <div class="clear"></div>
                    {% if edu.gpa %}<div style="margin-top: 2px; font-size: 11px;"><strong>GPA:</strong> {{ edu.gpa }}</div>{% endif %}
                </div>
            </div>
            {% endfor %}
        </div>
        {% endif %}

        <!-- Skills -->
        {% if skills %}
        <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills-grid">
                {% for category, skill_list in skills.items() %}
                <div class="skill-category">
                    <h4>{{ category }}:</h4>
                    <span class="skill-tags">
                        {% for skill in skill_list %}
                        <span class="skill-tag">{{ skill }}</span>
                        {% endfor %}
                    </span>
                </div>
                {% endfor %}
            </div>
        </div>
        {% endif %}

        <!-- Projects -->
        {% if projects %}
        <div class="section">
            <div class="section-title">Projects</div>
            {% for project in projects %}
            <div class="project-item">
                <div class="item-header">
                    <span class="item-title">{{ project.name }}</span>
                    <span class="item-subtitle">{{ project.description }}</span>
                    {% if project.url %}<span class="item-date">{{ project.url }}</span>{% endif %}
                    <div class="clear"></div>
                </div>
                
                {% if project.technologies %}
                <div class="project-tech">
                    <strong>Technologies:</strong>
                    {% for tech in project.technologies %}
                    <span class="tech-tag">{{ tech }}</span>
                    {% endfor %}
                </div>
                {% endif %}
                
                {% if project.achievements %}
                <div class="bullet-points">
                    <strong>Achievements:</strong>
                    {% for ach in project.achievements %}
                    <li class="bullet-point">{{ ach }}</li>
                    {% endfor %}
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </div>
        {% endif %}

        <!-- Certifications -->
        {% if certifications %}
        <div class="section">
            <div class="section-title">Certifications</div>
            <ul class="certifications">
                {% for cert in certifications %}
                <li class="certification-item">{{ cert }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endif %}

        <!-- Languages -->
        {% if languages %}
        <div class="section">
            <div class="section-title">Languages</div>
            <div class="languages-list">{{ languages | join(', ') }}</div>
        </div>
        {% endif %}
    </body>
    </html>
            """

class ResumeOptimizer:
    """Enhanced Resume Optimizer with LangChain integration"""
    def __init__(self):
        self.action_verbs = [
            "Achieved", "Developed", "Implemented", "Led", "Managed", "Created",
            "Designed", "Established", "Improved", "Increased", "Reduced",
            "Streamlined", "Optimized", "Delivered", "Executed", "Launched"
        ]
        
        self.weak_verbs = [
            "responsible for", "worked on", "helped with", "assisted",
            "participated in", "involved in", "duties included"
        ]
        
        # Initialize LangChain components
        self.llm = Ollama(model="llama3.2:3b", temperature=0.3)
        self.output_parser = StrOutputParser()

    def extract_keywords_from_job_description(self, job_description: str) -> List[str]:
        """Extract relevant keywords from job description"""
        if not job_description:
            return []
        
        # Create a prompt template for keyword extraction
        keyword_prompt = ChatPromptTemplate.from_template("""
        Extract the most important technical and professional keywords from this job description.
        Focus on skills, technologies, methodologies, and qualifications mentioned as requirements.
        Return only a comma-separated list of keywords, nothing else.
        
        Job Description:
        {job_description}
        """)
        
        # Create a chain
        keyword_chain = (
            {"job_description": RunnablePassthrough()}
            | keyword_prompt
            | self.llm
            | self.output_parser
        )
        
        try:
            # Invoke the chain
            keyword_response = keyword_chain.invoke(job_description)
            
            # Process the response
            keywords = [kw.strip() for kw in keyword_response.split(",") if kw.strip()]
            return list(set(keywords))[:20]  # Limit to top 20 unique keywords
            
        except Exception as e:
            print(f"Error extracting keywords with LangChain: {e}")
            # Fallback to regex-based extraction
            return self._fallback_keyword_extraction(job_description)
    
    def _fallback_keyword_extraction(self, job_description: str) -> List[str]:
        """Fallback keyword extraction using regex"""
        keywords = []
        text = job_description.lower()
        
        # Technical skills patterns
        tech_patterns = r'\b(?:python|java|javascript|react|node\.?js|sql|aws|docker|kubernetes|machine learning|ai|data science|agile|scrum)\b'
        keywords.extend(re.findall(tech_patterns, text, re.IGNORECASE))
        
        # Extract words that appear after common requirement indicators
        requirement_patterns = r'(?:require[ds]?|must have|should have|experience with|knowledge of|proficient in|familiar with)[\s:]+([^.!?]+)'
        matches = re.findall(requirement_patterns, text, re.IGNORECASE)
        for match in matches:
            words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.]*\b', match)
            keywords.extend(words[:5])
        
        return list(set(keywords))

    def analyze_resume_content(self, resume_data: ResumeData, job_keywords: List[str]) -> Dict[str, Any]:
        """Analyze resume content and provide scoring"""
        analysis = {
            "impact_score": 0,
            "keyword_score": 0,
            "formatting_score": 0,
            "brevity_score": 0,
            "issues": [],
            "suggestions": []
        }
        
        analysis["impact_score"] = self._analyze_impact(resume_data)
        analysis["keyword_score"] = self._analyze_keywords(resume_data, job_keywords)
        analysis["formatting_score"] = self._analyze_formatting(resume_data)
        analysis["brevity_score"] = self._analyze_brevity(resume_data)
        
        return analysis

    def _analyze_impact(self, resume_data: ResumeData) -> int:
        """Analyze impact and quantification in resume"""
        score = 0
        total_points = 0
        
        for experience in resume_data.work_experience:
            for responsibility in experience.responsibilities + experience.achievements:
                total_points += 1
                if re.search(r'\d+%|\$\d+|(\d+,)?\d+\s+(users|customers|people|projects|team|members)', responsibility):
                    score += 1
                if any(verb.lower() in responsibility.lower() for verb in self.action_verbs):
                    score += 1
        
        return min(100, int((score / max(total_points, 1)) * 100))

    def _analyze_keywords(self, resume_data: ResumeData, job_keywords: List[str]) -> int:
        """Analyze keyword optimization"""
        if not job_keywords:
            return 85
        
        resume_text = self._extract_resume_text(resume_data).lower()
        matched_keywords = sum(1 for keyword in job_keywords if keyword.lower() in resume_text)
        
        return min(100, int((matched_keywords / len(job_keywords)) * 100))

    def _analyze_formatting(self, resume_data: ResumeData) -> int:
        """Analyze formatting and structure"""
        score = 100
        
        if not resume_data.professional_summary:
            score -= 10
        if not resume_data.work_experience:
            score -= 20
        if not resume_data.education:
            score -= 10
        if not resume_data.skills:
            score -= 15
        
        return max(0, score)

    def _analyze_brevity(self, resume_data: ResumeData) -> int:
        """Analyze brevity and conciseness"""
        total_text = self._extract_resume_text(resume_data)
        word_count = len(total_text.split())
        
        if 400 <= word_count <= 800:
            return 100
        elif word_count < 400:
            return max(60, 100 - (400 - word_count) // 10 * 5)
        else:
            return max(60, 100 - (word_count - 800) // 50 * 5)

    def _extract_resume_text(self, resume_data: ResumeData) -> str:
        """Extract all text from resume data"""
        text_parts = []
        
        if resume_data.professional_summary:
            text_parts.append(resume_data.professional_summary)
        
        for exp in resume_data.work_experience:
            text_parts.extend(exp.responsibilities + exp.achievements)
        
        for skill_list in resume_data.skills.values():
            text_parts.extend(skill_list)
        
        for project in resume_data.projects:
            text_parts.append(project.description)
            text_parts.extend(project.achievements)
        
        return " ".join(text_parts)

    def generate_resume(self, resume_data: ResumeData, analysis: Dict[str, Any], 
                       job_keywords: List[str], format_type: str = "professional") -> str:
        """Generate optimized resume using LangChain pipelines"""
        try:
            # Create chains for each section
            summary_chain = self._create_summary_chain()
            bullet_chain = self._create_bullet_chain()
            project_chain = self._create_project_chain()
            
            # Optimize professional summary
            optimized_summary = summary_chain.invoke({
                "current_summary": resume_data.professional_summary or "",
                "job_keywords": job_keywords
            })
            
            # Optimize work experience
            optimized_experience = []
            for exp in resume_data.work_experience:
                # Optimize responsibilities
                optimized_responsibilities = []
                for resp in exp.responsibilities:
                    optimized_resp = bullet_chain.invoke({
                        "bullet_point": resp,
                        "job_keywords": job_keywords,
                        "point_type": "responsibility"
                    })
                    optimized_responsibilities.append(optimized_resp)
                
                # Optimize achievements
                optimized_achievements = []
                for ach in exp.achievements:
                    optimized_ach = bullet_chain.invoke({
                        "bullet_point": ach,
                        "job_keywords": job_keywords,
                        "point_type": "achievement"
                    })
                    optimized_achievements.append(optimized_ach)
                
                optimized_experience.append(WorkExperience(
                    company=exp.company,
                    position=exp.position,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    location=exp.location,
                    responsibilities=optimized_responsibilities,
                    achievements=optimized_achievements
                ))
            
            # Optimize projects
            optimized_projects = []
            for project in resume_data.projects:
                optimized_description = project_chain.invoke({
                    "name": project.name,
                    "description": project.description,
                    "technologies": project.technologies,
                    "job_keywords": job_keywords
                })
                
                optimized_achievements = []
                for ach in project.achievements:
                    optimized_ach = bullet_chain.invoke({
                        "bullet_point": ach,
                        "job_keywords": job_keywords,
                        "point_type": "project achievement"
                    })
                    optimized_achievements.append(optimized_ach)
                
                optimized_projects.append(Project(
                    name=project.name,
                    description=optimized_description,
                    technologies=project.technologies,
                    achievements=optimized_achievements,
                    url=project.url
                ))
            
            # Combine all sections into final resume
            return self._combine_sections(
                resume_data, optimized_summary, optimized_experience, optimized_projects
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating resume with LangChain: {str(e)}")

    def _create_summary_chain(self):
        """Create LangChain pipeline for summary optimization"""
        prompt = ChatPromptTemplate.from_template("""
        You are an expert resume writer. Optimize this professional summary to be more impactful and ATS-friendly.

        CURRENT SUMMARY:
        {current_summary}

        TARGET KEYWORDS TO INCLUDE: {job_keywords}

        REQUIREMENTS:
        - Keep it 3-4 lines maximum
        - Include relevant keywords naturally
        - Focus on quantifiable achievements and years of experience
        - Make it compelling and specific
        - Use active voice and strong action words

        Write ONLY the optimized professional summary, nothing else:
        """)
        
        return (
            {
                "current_summary": RunnablePassthrough(),
                "job_keywords": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | self.output_parser
            | RunnableLambda(lambda x: x.strip())
        )

    def _create_bullet_chain(self):
        """Create LangChain pipeline for bullet point optimization"""
        prompt = ChatPromptTemplate.from_template("""
        You are an expert resume writer. Optimize this single {point_type} bullet point to be more impactful.

        CURRENT BULLET POINT:
        {bullet_point}

        TARGET KEYWORDS: {job_keywords}

        REQUIREMENTS:
        - Start with a strong action verb
        - Add specific metrics/numbers if possible
        - Include relevant keywords naturally
        - Keep it 1-2 lines maximum
        - Make it quantifiable and results-focused
        - Use active voice

        Write ONLY the optimized bullet point, nothing else:
        """)
        
        return (
            {
                "bullet_point": RunnablePassthrough(),
                "job_keywords": RunnablePassthrough(),
                "point_type": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | self.output_parser
            | RunnableLambda(lambda x: x.strip().lstrip('-•*').strip())
        )

    def _create_project_chain(self):
        """Create LangChain pipeline for project optimization"""
        prompt = ChatPromptTemplate.from_template("""
        You are an expert resume writer. Optimize this project description to be more impactful and technical.

        PROJECT NAME: {name}
        CURRENT DESCRIPTION: {description}
        TECHNOLOGIES USED: {technologies}
        TARGET KEYWORDS: {job_keywords}

        REQUIREMENTS:
        - Keep it 2-3 lines maximum
        - Include relevant technical keywords
        - Focus on what the project accomplished
        - Make it sound professional and impactful
        - Include scale/scope if possible

        Write ONLY the optimized project description, nothing else:
        """)
        
        return (
            {
                "name": RunnablePassthrough(),
                "description": RunnablePassthrough(),
                "technologies": RunnablePassthrough(),
                "job_keywords": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | self.output_parser
            | RunnableLambda(lambda x: x.strip())
        )

    def _combine_sections(self, original_data: ResumeData, optimized_summary: str,
                     optimized_experience: List[WorkExperience], 
                     optimized_projects: List[Project]) -> str:
        """Combine all sections into final resume text"""
        resume_sections = []
        
        # Personal Info
        resume_sections.append("**Personal Information:**")
        for key, value in original_data.personal_info.items():
            resume_sections.append(f"{key.title()}: {value}")
        
        # Professional Summary
        resume_sections.append(f"\n**Professional Summary:**\n{optimized_summary}")
        
        # Work Experience
        if optimized_experience:
            resume_sections.append("\n**Work Experience:**")
            for exp in optimized_experience:
                resume_sections.append(f"\n**{exp.position} at {exp.company} ({exp.start_date} - {exp.end_date or 'Present'})**")
                if exp.location:
                    resume_sections.append(f"Location: {exp.location}")
                
                if exp.responsibilities:
                    resume_sections.append("\nResponsibilities:")
                    for resp in exp.responsibilities:
                        resume_sections.append(f"• {resp}")
                
                if exp.achievements:
                    resume_sections.append("\nAchievements:")
                    for ach in exp.achievements:
                        resume_sections.append(f"• {ach}")
        
        # Education
        if original_data.education:
            resume_sections.append("\n**Education:**")
            for edu in original_data.education:
                resume_sections.append(f"\n**{edu.degree} in {edu.field_of_study}**")
                resume_sections.append(f"{edu.institution} - {edu.graduation_date}")
                if edu.gpa:
                    resume_sections.append(f"GPA: {edu.gpa}")
        
        # Technical Skills
        if original_data.skills:
            resume_sections.append("\n**Technical Skills:**")
            for category, skill_list in original_data.skills.items():
                resume_sections.append(f"\n{category}:")
                resume_sections.append(", ".join(skill_list))
        
        # Projects
        if optimized_projects:
            resume_sections.append("\n**Projects:**")
            for project in optimized_projects:
                resume_sections.append(f"\n**{project.name}**")
                resume_sections.append(f"{project.description}")
                resume_sections.append(f"Technologies: {', '.join(project.technologies)}")
                
                if project.achievements:
                    resume_sections.append("\nAchievements:")
                    for ach in project.achievements:
                        resume_sections.append(f"• {ach}")
                
                if project.url:
                    resume_sections.append(f"URL: {project.url}")
        
        # Certifications
        if original_data.certifications:
            resume_sections.append("\n**Certifications:**")
            for cert in original_data.certifications:
                resume_sections.append(f"• {cert}")
        
        # Languages
        if original_data.languages:
            resume_sections.append(f"\n**Languages:** {', '.join(original_data.languages)}")
        
        return "\n".join(resume_sections)

# Initialize components
resume_optimizer = ResumeOptimizer()
html_generator = HTMLResumeGenerator()

# In-memory storage
resume_store = {}

# API endpoints
@app.post("/api/generate-resume", response_model=ResumeResponse)
async def generate_resume(request: ResumeRequest):
    """Generate an optimized resume with HTML and optional PDF, then upload to Cloudinary"""
    try:
        # Extract keywords from job description
        job_keywords = resume_optimizer.extract_keywords_from_job_description(
            request.job_description or ""
        )
        # Analyze resume content
        analysis = resume_optimizer.analyze_resume_content(
            request.resume_data, job_keywords
        )
        # Generate optimized resume using LangChain
        optimized_resume = resume_optimizer.generate_resume(
            request.resume_data, analysis, job_keywords, request.resume_format
        )
        # Calculate overall score
        overall_score = int((
            analysis["impact_score"] * 0.4 +
            analysis["keyword_score"] * 0.3 +
            analysis["formatting_score"] * 0.2 +
            analysis["brevity_score"] * 0.1
        ))
        # Generate suggestions
        suggestions = []
        if analysis["impact_score"] < 70:
            suggestions.append("Add more quantified achievements with specific metrics and numbers")
        if analysis["keyword_score"] < 70:
            suggestions.append("Include more relevant keywords from the job description")
        if analysis["formatting_score"] < 80:
            suggestions.append("Ensure all required sections are present and well-structured")
        # Generate HTML content
        resume_id = str(uuid.uuid4())
        html_content = html_generator.generate_resume_html(
            request.resume_data, optimized_resume, analysis, resume_id
        )
        # Try to generate PDF
        pdf_path = html_generator.generate_resume_pdf(html_content, resume_id)
        pdf_available = pdf_path is not None
        
        # Create response
        response = ResumeResponse(
            resume_id=resume_id,
            optimized_resume=optimized_resume,
            score=overall_score,
            feedback=analysis,
            suggestions=suggestions,
            html_content=html_content,
            pdf_available=pdf_available
        )
        
        # Store resume data
        resume_store[resume_id] = {
            "request": request.dict(),
            "response": response.dict(),
            "html_content": html_content,
            "pdf_path": pdf_path,
            "created_at": datetime.now().isoformat()
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")

@app.get("/api/my-resumes/{user_id}")
async def list_user_resumes(user_id: str):
    """List all resumes for a user from local storage"""
    try:
        # Filter resumes by user_id from local storage
        user_resumes = []
        for resume_id, data in resume_store.items():
            stored_user_id = data.get("request", {}).get("resume_data", {}).get("personal_info", {}).get("user_id") or \
                           data.get("request", {}).get("resume_data", {}).get("personal_info", {}).get("id")
            if stored_user_id == user_id:
                user_resumes.append({
                    "resume_id": resume_id,
                    "created_at": data["created_at"],
                    "score": data["response"]["score"],
                    "pdf_available": data["response"]["pdf_available"]
                })
        
        user_resumes.sort(key=lambda x: x["created_at"], reverse=True)
        return {"resumes": user_resumes, "total": len(user_resumes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing resumes: {str(e)}")

@app.delete("/api/my-resume/{user_id}/{resume_id}")
async def delete_user_resume(user_id: str, resume_id: str):
    """Delete a user's resume from local storage"""
    try:
        if resume_id not in resume_store:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        stored_resume = resume_store[resume_id]
        stored_user_id = stored_resume.get("request", {}).get("resume_data", {}).get("personal_info", {}).get("user_id") or \
                        stored_resume.get("request", {}).get("resume_data", {}).get("personal_info", {}).get("id")
        
        if stored_user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this resume")
        
        # Delete PDF file if it exists
        pdf_path = stored_resume.get("pdf_path")
        if pdf_path and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except OSError as e:
                print(f"Warning: Could not delete PDF file {pdf_path}: {e}")
        
        # Remove from memory store
        del resume_store[resume_id]
        
        return {"message": f"Resume {resume_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting resume: {str(e)}")
        
@app.get("/api/resume/{resume_id}/pdf")
async def download_resume_pdf(resume_id: str):
    """Download the generated PDF resume"""
    if resume_id not in resume_store:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    stored_resume = resume_store[resume_id]
    pdf_path = stored_resume.get("pdf_path")
    
    if not pdf_path:
        raise HTTPException(status_code=404, detail="PDF was not generated for this resume")
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")
    
    try:
        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename=f"resume_{resume_id}.pdf",
            headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving PDF file: {str(e)}")

@app.get("/api/resume/{resume_id}/html", response_class=HTMLResponse)
async def get_resume_html(resume_id: str):
    """Get the HTML version of the resume"""
    if resume_id not in resume_store:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    stored_resume = resume_store[resume_id]
    html_content = stored_resume.get("html_content")
    
    if not html_content:
        raise HTTPException(status_code=404, detail="HTML content not found")
    
    return HTMLResponse(content=html_content)

@app.get("/api/resume/{resume_id}")
async def get_resume_data(resume_id: str):
    """Get resume data and metadata"""
    if resume_id not in resume_store:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    stored_resume = resume_store[resume_id]
    
    return {
        "resume_id": resume_id,
        "created_at": stored_resume["created_at"],
        "score": stored_resume["response"]["score"],
        "feedback": stored_resume["response"]["feedback"],
        "suggestions": stored_resume["response"]["suggestions"],
        "pdf_available": stored_resume["response"]["pdf_available"],
        "optimized_resume": stored_resume["response"]["optimized_resume"]
    }

@app.get("/api/resumes")
async def list_resumes():
    """List all generated resumes"""
    resumes = []
    for resume_id, data in resume_store.items():
        resumes.append({
            "resume_id": resume_id,
            "created_at": data["created_at"],
            "score": data["response"]["score"],
            "name": data["request"]["resume_data"]["personal_info"].get("name", "Unknown"),
            "pdf_available": data["response"]["pdf_available"]
        })
    
    # Sort by creation date, newest first
    resumes.sort(key=lambda x: x["created_at"], reverse=True)
    return {"resumes": resumes, "total": len(resumes)}

@app.delete("/api/resume/{resume_id}")
async def delete_resume(resume_id: str):
    """Delete a resume and its associated files"""
    if resume_id not in resume_store:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    stored_resume = resume_store[resume_id]
    
    # Delete PDF file if it exists
    pdf_path = stored_resume.get("pdf_path")
    if pdf_path and os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
        except OSError as e:
            print(f"Warning: Could not delete PDF file {pdf_path}: {e}")
    
    # Remove from memory store
    del resume_store[resume_id]
    
    return {"message": f"Resume {resume_id} deleted successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        ollama_status = "unhealthy"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ollama_status": ollama_status,
        "total_resumes": len(resume_store)
    }

@app.on_event("startup")
async def cleanup_old_files():
    """Clean up old temporary PDF files on startup"""
    temp_dir = tempfile.gettempdir()
    try:
        for filename in os.listdir(temp_dir):
            if filename.startswith("resume_") and filename.endswith(".pdf"):
                file_path = os.path.join(temp_dir, filename)
                # Delete files older than 24 hours
                if os.path.getctime(file_path) < (datetime.now().timestamp() - 86400):
                    os.remove(file_path)
                    print(f"Cleaned up old file: {filename}")
    except Exception as e:
        print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)