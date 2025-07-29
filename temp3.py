from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import HTMLResponse
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

app = FastAPI(title="Resume Maker API with HTML PDF Generation", version="2.0.0")

# Pydantic models (same as before)
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
    theme: str = Field("professional", description="Theme for the resume: professional, modern, creative, minimal, technical")

class ResumeResponse(BaseModel):
    resume_id: str
    optimized_resume: str
    score: int
    feedback: Dict[str, Any]
    suggestions: List[str]
    html_content: str
    pdf_available: bool = True

class HTMLResumeGenerator:
    def __init__(self):
        self.template_dir = "html_templates"
        self.ensure_template_dir()
        self.themes = {
            "professional": self._get_professional_template(),
            "modern": self._get_modern_template(),
            "creative": self._get_creative_template(),
            "minimal": self._get_minimal_template(),
            "technical": self._get_technical_template()
        }
    
    def ensure_template_dir(self):
        """Ensure template directory exists"""
        if not os.path.exists(self.template_dir):
            os.makedirs(self.template_dir)
    
    def generate_resume_html(self, resume_data: ResumeData, optimized_content: str, 
                           analysis: Dict[str, Any], resume_id: str, theme: str = "professional") -> str:
        """Generate HTML resume with selected theme"""
        template = self.themes.get(theme, self.themes["professional"])
        
        # Prepare template variables
        template_vars = {
            'personal_info': resume_data.personal_info,
            'professional_summary': resume_data.professional_summary,
            'work_experience': resume_data.work_experience,
            'education': resume_data.education,
            'skills': resume_data.skills,
            'projects': resume_data.projects,
            'certifications': resume_data.certifications,
            'languages': resume_data.languages,
            'analysis': analysis,
            'resume_id': resume_id,
            'theme': theme
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
            # If PDF generation fails, return None but continue with HTML
            print(f"PDF generation failed: {e}")
            return None
        

    def _get_professional_template(self) -> str:
        """Professional theme template (existing one)"""
        return """
        <!DOCTYPE html>
        <!-- Existing professional template HTML -->
        """
    
    def _get_modern_template(self) -> str:
        """Modern theme template"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{ personal_info.name }} - Resume</title>
            <style>
                :root {
                    --primary-color: #4a6fa5;
                    --secondary-color: #166088;
                    --accent-color: #4fc3f7;
                    --text-color: #333;
                    --light-bg: #f8f9fa;
                    --dark-bg: #2c3e50;
                }
                
                body {
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: var(--text-color);
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 0;
                    background: white;
                }
                
                .resume-container {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    min-height: 100vh;
                }
                
                .sidebar {
                    background: var(--dark-bg);
                    color: white;
                    padding: 30px;
                }
                
                .main-content {
                    padding: 30px;
                }
                
                .name {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: white;
                    border-bottom: 2px solid var(--accent-color);
                    padding-bottom: 10px;
                }
                
                .title {
                    font-size: 1.2em;
                    color: var(--accent-color);
                    margin-bottom: 20px;
                }
                
                .contact-info {
                    margin-bottom: 30px;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section-title {
                    font-size: 1.3em;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .sidebar .section-title {
                    color: var(--accent-color);
                }
                
                .experience-item, .education-item {
                    margin-bottom: 20px;
                }
                
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .item-title {
                    font-weight: bold;
                    font-size: 1.1em;
                }
                
                .item-subtitle {
                    color: var(--secondary-color);
                }
                
                .item-date {
                    color: #777;
                }
                
                ul {
                    padding-left: 20px;
                }
                
                li {
                    margin-bottom: 5px;
                }
                
                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                }
                
                .skill-category {
                    margin-bottom: 15px;
                }
                
                .skill-name {
                    margin-bottom: 5px;
                }
                
                .progress-bar {
                    height: 5px;
                    background: #ddd;
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .progress {
                    height: 100%;
                    background: var(--primary-color);
                }
                
                @media print {
                    body {
                        font-size: 12px;
                    }
                    
                    .resume-container {
                        grid-template-columns: 1fr 2fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="name">{{ personal_info.name }}</div>
                    {% if professional_summary %}
                    <div class="title">{{ professional_summary.split('.')[0] }}.</div>
                    {% endif %}
                    
                    <div class="contact-info">
                        {% if personal_info.email %}
                        <div class="contact-item">📧 {{ personal_info.email }}</div>
                        {% endif %}
                        {% if personal_info.phone %}
                        <div class="contact-item">📱 {{ personal_info.phone }}</div>
                        {% endif %}
                        {% if personal_info.location %}
                        <div class="contact-item">📍 {{ personal_info.location }}</div>
                        {% endif %}
                        {% if personal_info.github %}
                        <div class="contact-item">🔗 {{ personal_info.github }}</div>
                        {% endif %}
                        {% if personal_info.linkedin %}
                        <div class="contact-item">💼 {{ personal_info.linkedin }}</div>
                        {% endif %}
                    </div>
                    
                    <!-- Skills -->
                    {% if skills %}
                    <div class="section">
                        <div class="section-title">Skills</div>
                        <div class="skills-grid">
                            {% for category, skill_list in skills.items() %}
                            <div class="skill-category">
                                <div class="skill-name">{{ category }}</div>
                                <div class="progress-bar">
                                    <div class="progress" style="width: 100%"></div>
                                </div>
                                <div style="margin-top: 5px;">
                                    {% for skill in skill_list %}
                                    <span style="display: inline-block; margin-right: 5px; margin-bottom: 5px; 
                                    background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;
                                    font-size: 0.8em;">{{ skill }}</span>
                                    {% endfor %}
                                </div>
                            </div>
                            {% endfor %}
                        </div>
                    </div>
                    {% endif %}
                    
                    <!-- Languages -->
                    {% if languages %}
                    <div class="section">
                        <div class="section-title">Languages</div>
                        <div>
                            {% for lang in languages %}
                            <div style="margin-bottom: 10px;">
                                <div>{{ lang }}</div>
                                <div class="progress-bar">
                                    <div class="progress" style="width: 100%"></div>
                                </div>
                            </div>
                            {% endfor %}
                        </div>
                    </div>
                    {% endif %}
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    <!-- Work Experience -->
                    {% if work_experience %}
                    <div class="section">
                        <div class="section-title">Work Experience</div>
                        {% for exp in work_experience %}
                        <div class="experience-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">{{ exp.position }}</div>
                                    <div class="item-subtitle">{{ exp.company }}</div>
                                </div>
                                <div class="item-date">{{ exp.start_date }} - {{ exp.end_date or 'Present' }}</div>
                            </div>
                            {% if exp.responsibilities %}
                            <ul>
                                {% for resp in exp.responsibilities %}
                                <li>{{ resp }}</li>
                                {% endfor %}
                            </ul>
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
                                <div>
                                    <div class="item-title">{{ edu.degree }} in {{ edu.field_of_study }}</div>
                                    <div class="item-subtitle">{{ edu.institution }}</div>
                                </div>
                                <div class="item-date">{{ edu.graduation_date }}</div>
                            </div>
                        </div>
                        {% endfor %}
                    </div>
                    {% endif %}
                    
                    <!-- Projects -->
                    {% if projects %}
                    <div class="section">
                        <div class="section-title">Projects</div>
                        {% for project in projects %}
                        <div class="experience-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title">{{ project.name }}</div>
                                    <div class="item-subtitle">{{ project.description }}</div>
                                </div>
                                {% if project.url %}
                                <div class="item-date">🔗 {{ project.url }}</div>
                                {% endif %}
                            </div>
                            <div style="margin-top: 5px;">
                                {% for tech in project.technologies %}
                                <span style="display: inline-block; margin-right: 5px; margin-bottom: 5px; 
                                background: #eee; padding: 2px 8px; border-radius: 12px;
                                font-size: 0.8em;">{{ tech }}</span>
                                {% endfor %}
                            </div>
                        </div>
                        {% endfor %}
                    </div>
                    {% endif %}
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_creative_template(self) -> str:
        """Creative theme template"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{ personal_info.name }} - Resume</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
                
                :root {
                    --primary-color: #ff6b6b;
                    --secondary-color: #4ecdc4;
                    --accent-color: #ffe66d;
                    --text-color: #2d3436;
                    --light-bg: #f7f1e3;
                }
                
                body {
                    font-family: 'Poppins', sans-serif;
                    line-height: 1.6;
                    color: var(--text-color);
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                }
                
                .resume-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid var(--primary-color);
                }
                
                .avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: var(--secondary-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2em;
                    font-weight: bold;
                    margin-right: 30px;
                    flex-shrink: 0;
                }
                
                .header-info {
                    flex-grow: 1;
                }
                
                .name {
                    font-size: 2.2em;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 5px;
                }
                
                .title {
                    font-size: 1.2em;
                    color: var(--text-color);
                    margin-bottom: 15px;
                }
                
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    font-size: 0.9em;
                }
                
                .section {
                    margin-bottom: 30px;
                }
                
                .section-title {
                    font-size: 1.4em;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    position: relative;
                    padding-left: 15px;
                }
                
                .section-title::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 5px;
                    height: 20px;
                    width: 5px;
                    background: var(--accent-color);
                }
                
                .experience-item, .education-item, .project-item {
                    margin-bottom: 25px;
                    position: relative;
                    padding-left: 20px;
                }
                
                .experience-item::before, .education-item::before, .project-item::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 5px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--secondary-color);
                }
                
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .item-title {
                    font-weight: bold;
                    font-size: 1.1em;
                }
                
                .item-subtitle {
                    color: var(--secondary-color);
                    font-style: italic;
                }
                
                .item-date {
                    background: var(--accent-color);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                
                ul {
                    padding-left: 20px;
                }
                
                li {
                    margin-bottom: 8px;
                    position: relative;
                }
                
                li::before {
                    content: "•";
                    color: var(--primary-color);
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                }
                
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .skill-category {
                    background: var(--light-bg);
                    padding: 15px;
                    border-radius: 8px;
                    flex: 1 1 200px;
                }
                
                .skill-category h4 {
                    margin-bottom: 10px;
                    color: var(--primary-color);
                }
                
                .skill-tag {
                    display: inline-block;
                    background: var(--secondary-color);
                    color: white;
                    padding: 3px 10px;
                    border-radius: 15px;
                    margin-right: 5px;
                    margin-bottom: 5px;
                    font-size: 0.8em;
                }
                
                .project-tech {
                    margin-top: 8px;
                }
                
                .tech-tag {
                    display: inline-block;
                    background: var(--primary-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    margin-right: 5px;
                    margin-bottom: 5px;
                    font-size: 0.8em;
                }
                
                @media print {
                    body {
                        padding: 15px;
                        font-size: 12px;
                    }
                    
                    .section {
                        margin-bottom: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="resume-header">
                <div class="avatar-placeholder">{{ personal_info.name[0] }}</div>
                <div class="header-info">
                    <div class="name">{{ personal_info.name }}</div>
                    {% if professional_summary %}
                    <div class="title">{{ professional_summary.split('.')[0] }}.</div>
                    {% endif %}
                    <div class="contact-info">
                        {% if personal_info.email %}
                        <div class="contact-item">📧 {{ personal_info.email }}</div>
                        {% endif %}
                        {% if personal_info.phone %}
                        <div class="contact-item">📱 {{ personal_info.phone }}</div>
                        {% endif %}
                        {% if personal_info.location %}
                        <div class="contact-item">📍 {{ personal_info.location }}</div>
                        {% endif %}
                    </div>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="resume-content">
                <!-- Left Column -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <!-- Professional Summary -->
                        {% if professional_summary %}
                        <div class="section">
                            <div class="section-title">About Me</div>
                            <div>{{ professional_summary }}</div>
                        </div>
                        {% endif %}
                        
                        <!-- Work Experience -->
                        {% if work_experience %}
                        <div class="section">
                            <div class="section-title">Work Experience</div>
                            {% for exp in work_experience %}
                            <div class="experience-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">{{ exp.position }}</div>
                                        <div class="item-subtitle">{{ exp.company }}</div>
                                    </div>
                                    <div class="item-date">{{ exp.start_date }} - {{ exp.end_date or 'Present' }}</div>
                                </div>
                                {% if exp.responsibilities %}
                                <ul>
                                    {% for resp in exp.responsibilities %}
                                    <li>{{ resp }}</li>
                                    {% endfor %}
                                </ul>
                                {% endif %}
                            </div>
                            {% endfor %}
                        </div>
                        {% endif %}
                    </div>
                    
                    <div>
                        <!-- Skills -->
                        {% if skills %}
                        <div class="section">
                            <div class="section-title">Skills</div>
                            <div class="skills-container">
                                {% for category, skill_list in skills.items() %}
                                <div class="skill-category">
                                    <h4>{{ category }}</h4>
                                    <div>
                                        {% for skill in skill_list %}
                                        <span class="skill-tag">{{ skill }}</span>
                                        {% endfor %}
                                    </div>
                                </div>
                                {% endfor %}
                            </div>
                        </div>
                        {% endif %}
                        
                        <!-- Education -->
                        {% if education %}
                        <div class="section">
                            <div class="section-title">Education</div>
                            {% for edu in education %}
                            <div class="education-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">{{ edu.degree }}</div>
                                        <div class="item-subtitle">{{ edu.institution }}</div>
                                    </div>
                                    <div class="item-date">{{ edu.graduation_date }}</div>
                                </div>
                            </div>
                            {% endfor %}
                        </div>
                        {% endif %}
                        
                        <!-- Projects -->
                        {% if projects %}
                        <div class="section">
                            <div class="section-title">Projects</div>
                            {% for project in projects %}
                            <div class="project-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">{{ project.name }}</div>
                                        <div class="item-subtitle">{{ project.description }}</div>
                                    </div>
                                    {% if project.url %}
                                    <div class="item-date">🔗 Link</div>
                                    {% endif %}
                                </div>
                                <div class="project-tech">
                                    {% for tech in project.technologies %}
                                    <span class="tech-tag">{{ tech }}</span>
                                    {% endfor %}
                                </div>
                            </div>
                            {% endfor %}
                        </div>
                        {% endif %}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_minimal_template(self) -> str:
        """Minimal theme template"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{ personal_info.name }} - Resume</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 40px;
                }
                
                .name {
                    font-size: 2.2em;
                    font-weight: 300;
                    letter-spacing: -1px;
                    margin-bottom: 5px;
                }
                
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 30px;
                    color: #666;
                    font-size: 0.9em;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section-title {
                    font-size: 1.1em;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    color: #444;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 5px;
                }
                
                .experience-item, .education-item {
                    margin-bottom: 20px;
                }
                
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .item-title {
                    font-weight: 500;
                }
                
                .item-subtitle {
                    color: #666;
                    font-style: italic;
                }
                
                .item-date {
                    color: #999;
                    font-size: 0.9em;
                }
                
                ul {
                    padding-left: 20px;
                    list-style-type: none;
                }
                
                li {
                    margin-bottom: 5px;
                    position: relative;
                }
                
                li::before {
                    content: "—";
                    position: absolute;
                    left: -20px;
                    color: #999;
                }
                
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .skill-tag {
                    color: #666;
                    font-size: 0.9em;
                }
                
                .skill-tag::after {
                    content: "•";
                    margin-left: 5px;
                    color: #ccc;
                }
                
                .skill-tag:last-child::after {
                    content: "";
                }
                
                @media print {
                    body {
                        padding: 20px;
                        font-size: 12px;
                    }
                    
                    .section {
                        margin-bottom: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="name">{{ personal_info.name }}</div>
            <div class="contact-info">
                {% if personal_info.email %}
                <span>{{ personal_info.email }}</span>
                {% endif %}
                {% if personal_info.phone %}
                <span>{{ personal_info.phone }}</span>
                {% endif %}
                {% if personal_info.location %}
                <span>{{ personal_info.location }}</span>
                {% endif %}
                {% if personal_info.github %}
                <span>{{ personal_info.github }}</span>
                {% endif %}
                {% if personal_info.linkedin %}
                <span>{{ personal_info.linkedin }}</span>
                {% endif %}
            </div>
            
            <!-- Professional Summary -->
            {% if professional_summary %}
            <div class="section">
                <div class="section-title">Summary</div>
                <div>{{ professional_summary }}</div>
            </div>
            {% endif %}
            
            <!-- Work Experience -->
            {% if work_experience %}
            <div class="section">
                <div class="section-title">Experience</div>
                {% for exp in work_experience %}
                <div class="experience-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">{{ exp.position }}</div>
                            <div class="item-subtitle">{{ exp.company }}</div>
                        </div>
                        <div class="item-date">{{ exp.start_date }} - {{ exp.end_date or 'Present' }}</div>
                    </div>
                    {% if exp.responsibilities %}
                    <ul>
                        {% for resp in exp.responsibilities %}
                        <li>{{ resp }}</li>
                        {% endfor %}
                    </ul>
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
                        <div>
                            <div class="item-title">{{ edu.degree }}</div>
                            <div class="item-subtitle">{{ edu.institution }}</div>
                        </div>
                        <div class="item-date">{{ edu.graduation_date }}</div>
                    </div>
                </div>
                {% endfor %}
            </div>
            {% endif %}
            
            <!-- Skills -->
            {% if skills %}
            <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills-container">
                    {% for category, skill_list in skills.items() %}
                    {% for skill in skill_list %}
                    <span class="skill-tag">{{ skill }}</span>
                    {% endfor %}
                    {% endfor %}
                </div>
            </div>
            {% endif %}
        </body>
        </html>
        """
    
    def _get_technical_template(self) -> str:
        """Technical theme template"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{ personal_info.name }} - Resume</title>
            <style>
                :root {
                    --primary-color: #2c3e50;
                    --secondary-color: #3498db;
                    --accent-color: #e74c3c;
                    --text-color: #333;
                    --code-bg: #f8f9fa;
                }
                
                body {
                    font-family: 'Roboto Mono', monospace, sans-serif;
                    line-height: 1.6;
                    color: var(--text-color);
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 30px;
                    background: white;
                }
                
                .header {
                    margin-bottom: 30px;
                    border-bottom: 2px solid var(--secondary-color);
                    padding-bottom: 20px;
                }
                
                .name {
                    font-size: 2em;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 5px;
                }
                
                .title {
                    font-size: 1.1em;
                    color: var(--accent-color);
                    margin-bottom: 15px;
                }
                
                .contact-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    font-size: 0.9em;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                }
                
                .section {
                    margin-bottom: 30px;
                }
                
                .section-title {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                
                .section-title::before {
                    content: "> ";
                    color: var(--accent-color);
                }
                
                .experience-item, .education-item, .project-item {
                    margin-bottom: 20px;
                    padding-left: 15px;
                    border-left: 2px solid var(--code-bg);
                }
                
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .item-title {
                    font-weight: bold;
                }
                
                .item-subtitle {
                    color: var(--secondary-color);
                }
                
                .item-date {
                    color: #777;
                    font-size: 0.9em;
                }
                
                ul {
                    padding-left: 20px;
                    list-style-type: none;
                }
                
                li {
                    margin-bottom: 8px;
                    position: relative;
                }
                
                li::before {
                    content: "-";
                    position: absolute;
                    left: -15px;
                    color: var(--accent-color);
                }
                
                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                
                .skill-category {
                    background: var(--code-bg);
                    padding: 15px;
                    border-radius: 5px;
                }
                
                .skill-category h4 {
                    color: var(--primary-color);
                    margin-bottom: 10px;
                    font-size: 0.9em;
                    text-transform: uppercase;
                }
                
                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .skill-tag {
                    background: var(--secondary-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 0.8em;
                }
                
                .project-tech {
                    margin-top: 8px;
                }
                
                .tech-tag {
                    display: inline-block;
                    background: var(--accent-color);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    margin-right: 5px;
                    margin-bottom: 5px;
                    font-size: 0.8em;
                }
                
                @media print {
                    body {
                        padding: 20px;
                        font-size: 12px;
                    }
                    
                    .section {
                        margin-bottom: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="header">
                <div class="name">{{ personal_info.name }}</div>
                {% if professional_summary %}
                <div class="title">{{ professional_summary.split('.')[0] }}.</div>
                {% endif %}
                <div class="contact-info">
                    {% if personal_info.email %}
                    <div class="contact-item">📧 {{ personal_info.email }}</div>
                    {% endif %}
                    {% if personal_info.phone %}
                    <div class="contact-item">📱 {{ personal_info.phone }}</div>
                    {% endif %}
                    {% if personal_info.location %}
                    <div class="contact-item">📍 {{ personal_info.location }}</div>
                    {% endif %}
                    {% if personal_info.github %}
                    <div class="contact-item">🔗 {{ personal_info.github }}</div>
                    {% endif %}
                    {% if personal_info.linkedin %}
                    <div class="contact-item">💼 {{ personal_info.linkedin }}</div>
                    {% endif %}
                </div>
            </div>
            
            <!-- Work Experience -->
            {% if work_experience %}
            <div class="section">
                <div class="section-title">Work Experience</div>
                {% for exp in work_experience %}
                <div class="experience-item">
                    <div class="item-header">
                        <div>
                            <div class="item-title">{{ exp.position }}</div>
                            <div class="item-subtitle">{{ exp.company }}</div>
                        </div>
                        <div class="item-date">{{ exp.start_date }} - {{ exp.end_date or 'Present' }}</div>
                    </div>
                    {% if exp.responsibilities %}
                    <ul>
                        {% for resp in exp.responsibilities %}
                        <li>{{ resp }}</li>
                        {% endfor %}
                    </ul>
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
                        <div>
                            <div class="item-title">{{ edu.degree }}</div>
                            <div class="item-subtitle">{{ edu.institution }}</div>
                        </div>
                        <div class="item-date">{{ edu.graduation_date }}</div>
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
                        <h4>{{ category }}</h4>
                        <div class="skill-tags">
                            {% for skill in skill_list %}
                            <span class="skill-tag">{{ skill }}</span>
                            {% endfor %}
                        </div>
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
                        <div>
                            <div class="item-title">{{ project.name }}</div>
                            <div class="item-subtitle">{{ project.description }}</div>
                        </div>
                        {% if project.url %}
                        <div class="item-date">🔗 {{ project.url }}</div>
                        {% endif %}
                    </div>
                    <div class="project-tech">
                        {% for tech in project.technologies %}
                        <span class="tech-tag">{{ tech }}</span>
                        {% endfor %}
                    </div>
                </div>
                {% endfor %}
            </div>
            {% endif %}
        </body>
        </html>
        """

    
    def _get_html_template(self) -> str:
        """Get professional HTML template"""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ personal_info.name }} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
            margin-bottom: 30px;
        }
        
        .name {
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 0.9em;
            color: #555;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .summary {
            font-style: italic;
            line-height: 1.8;
            color: #555;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #3498db;
        }
        
        .experience-item, .education-item, .project-item {
            margin-bottom: 25px;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        
        .item-title {
            font-weight: bold;
            font-size: 1.1em;
            color: #2c3e50;
        }
        
        .item-subtitle {
            color: #7f8c8d;
            font-style: italic;
        }
        
        .item-date {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .item-location {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .responsibilities, .achievements {
            margin-top: 10px;
        }
        
        .responsibilities ul, .achievements ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        
        .responsibilities li, .achievements li {
            margin-bottom: 5px;
            line-height: 1.5;
        }
        
        .achievements li {
            color: #27ae60;
            font-weight: 500;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .skill-category {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        
        .skill-category h4 {
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .skill-tag {
            background: #3498db;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        
        .project-tech {
            margin-top: 8px;
        }
        
        .tech-tag {
            background: #e74c3c;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.75em;
            margin-right: 5px;
        }
        
        .certifications ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .certifications li {
            background: #f39c12;
            color: white;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 5px;
            font-weight: 500;
        }
        
        .optimization-scores {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .score-item {
            text-align: center;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .score-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .score-label {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-top: 5px;
        }
        
        @media print {
            body {
                font-size: 12px;
                line-height: 1.4;
            }
            
            .optimization-scores {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="name">{{ personal_info.name }}</div>
        <div class="contact-info">
            {% if personal_info.email %}
            <div class="contact-item">📧 {{ personal_info.email }}</div>
            {% endif %}
            {% if personal_info.phone %}
            <div class="contact-item">📱 {{ personal_info.phone }}</div>
            {% endif %}
            {% if personal_info.location %}
            <div class="contact-item">📍 {{ personal_info.location }}</div>
            {% endif %}
            {% if personal_info.github %}
            <div class="contact-item">🔗 {{ personal_info.github }}</div>
            {% endif %}
            {% if personal_info.linkedin %}
            <div class="contact-item">💼 {{ personal_info.linkedin }}</div>
            {% endif %}
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
        <div class="section-title">Work Experience</div>
        {% for exp in work_experience %}
        <div class="experience-item">
            <div class="item-header">
                <div>
                    <div class="item-title">{{ exp.position }}</div>
                    <div class="item-subtitle">{{ exp.company }}</div>
                    {% if exp.location %}
                    <div class="item-location">{{ exp.location }}</div>
                    {% endif %}
                </div>
                <div class="item-date">{{ exp.start_date }} - {{ exp.end_date or 'Present' }}</div>
            </div>
            
            {% if exp.responsibilities %}
            <div class="responsibilities">
                <ul>
                    {% for resp in exp.responsibilities %}
                    <li>{{ resp }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
            
            {% if exp.achievements %}
            <div class="achievements">
                <strong>Key Achievements:</strong>
                <ul>
                    {% for ach in exp.achievements %}
                    <li>{{ ach }}</li>
                    {% endfor %}
                </ul>
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
                <div>
                    <div class="item-title">{{ edu.degree }} in {{ edu.field_of_study }}</div>
                    <div class="item-subtitle">{{ edu.institution }}</div>
                    {% if edu.gpa %}
                    <div class="item-location">GPA: {{ edu.gpa }}</div>
                    {% endif %}
                </div>
                <div class="item-date">{{ edu.graduation_date }}</div>
            </div>
            
            {% if edu.relevant_coursework %}
            <div style="margin-top: 8px;">
                <strong>Relevant Coursework:</strong> {{ edu.relevant_coursework | join(', ') }}
            </div>
            {% endif %}
        </div>
        {% endfor %}
    </div>
    {% endif %}

    <!-- Technical Skills -->
    {% if skills %}
    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
            {% for category, skill_list in skills.items() %}
            <div class="skill-category">
                <h4>{{ category }}</h4>
                <div class="skill-tags">
                    {% for skill in skill_list %}
                    <span class="skill-tag">{{ skill }}</span>
                    {% endfor %}
                </div>
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
                <div>
                    <div class="item-title">{{ project.name }}</div>
                    <div class="item-subtitle">{{ project.description }}</div>
                </div>
                {% if project.url %}
                <div class="item-date">🔗 {{ project.url }}</div>
                {% endif %}
            </div>
            
            <div class="project-tech">
                <strong>Technologies:</strong>
                {% for tech in project.technologies %}
                <span class="tech-tag">{{ tech }}</span>
                {% endfor %}
            </div>
            
            {% if project.achievements %}
            <div class="achievements">
                <ul>
                    {% for ach in project.achievements %}
                    <li>{{ ach }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
        </div>
        {% endfor %}
    </div>
    {% endif %}

    <!-- Certifications -->
    {% if certifications %}
    <div class="section">
        <div class="section-title">Certifications & Achievements</div>
        <div class="certifications">
            <ul>
                {% for cert in certifications %}
                <li>{{ cert }}</li>
                {% endfor %}
            </ul>
        </div>
    </div>
    {% endif %}

    <!-- Languages -->
    {% if languages %}
    <div class="section">
        <div class="section-title">Languages</div>
        <div>{{ languages | join(', ') }}</div>
    </div>
    {% endif %}
</body>
</html>
        """

class ResumeOptimizer:
    def __init__(self):
        self.action_verbs = [
            "Achieved", "Developed", "Implemented", "Led", "Managed", "Created",
            "Designed", "Established", "Improved", "Increased", "Reduced",
            "Streamlined", "Optimized", "Delivered", "Executed", "Launched",
            "Built", "Transformed", "Generated", "Accelerated", "Enhanced"
        ]
        
        self.weak_verbs = [
            "responsible for", "worked on", "helped with", "assisted",
            "participated in", "involved in", "duties included"
        ]

    def extract_keywords_from_job_description(self, job_description: str) -> List[str]:
        """Extract relevant keywords from job description"""
        if not job_description:
            return []
        
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

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama3.1"

    def generate_resume(self, resume_data: ResumeData, analysis: Dict[str, Any], 
                       job_keywords: List[str], format_type: str = "professional") -> str:
        """Generate optimized resume using Ollama"""
        prompt = self._build_resume_prompt(resume_data, analysis, job_keywords, format_type)
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": 2000,
                        "num_ctx": 4096,
                        "num_predict": 2000,
                        "repeat_penalty": 1.1,
                        "top_k": 40
                    }
                },
                timeout=600
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                raise HTTPException(status_code=500, detail="Failed to generate resume with Ollama")
                
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Ollama connection error: {str(e)}")

    def _build_resume_prompt(self, resume_data: ResumeData, analysis: Dict[str, Any], 
                           job_keywords: List[str], format_type: str) -> str:
        """Build comprehensive prompt for resume generation"""
        current_info = self._format_current_resume_data(resume_data)
        
        prompt = f"""
You are an expert resume writer and ATS optimization specialist. Create an optimized, professional resume based on the following information and guidelines.

CURRENT RESUME DATA:
{current_info}

TARGET JOB KEYWORDS TO INCLUDE:
{', '.join(job_keywords) if job_keywords else 'N/A'}

OPTIMIZATION REQUIREMENTS:
1. IMPACT & QUANTIFICATION:
   - Transform all bullet points to start with strong action verbs
   - Add specific numbers, percentages, and metrics wherever possible
   - Focus on achievements and results, not just responsibilities
   - Use these action verbs: {', '.join(['Achieved', 'Developed', 'Implemented', 'Led', 'Managed', 'Created', 'Improved', 'Increased', 'Reduced', 'Optimized'])}

2. KEYWORD OPTIMIZATION:
   - Naturally incorporate the target keywords throughout the resume
   - Ensure skills section includes relevant technical and soft skills
   - Match job requirements with experience descriptions

3. FORMATTING BEST PRACTICES:
   - Use standard section headers: Professional Summary, Work Experience, Education, Skills, Projects
   - Keep bullet points concise but informative (1-2 lines each)
   - Use reverse chronological order for experience
   - Ensure ATS-friendly formatting

4. BREVITY & CLARITY:
   - Keep the resume focused and relevant
   - Remove redundant information
   - Use professional language, avoid jargon
   - Ensure each bullet point adds value

RESUME FORMAT STYLE: {format_type}

Generate a complete, well-structured resume that incorporates all the above requirements. The resume should be professional, ATS-friendly, and compelling to human recruiters.

IMPORTANT: 
- Start each work experience bullet with a strong action verb
- Include specific metrics and achievements
- Integrate keywords naturally
- Keep the language professional and impactful
- Format should be clean and readable

Resume:
"""
        return prompt

    def _format_current_resume_data(self, resume_data: ResumeData) -> str:
        """Format current resume data for the prompt"""
        formatted = []
        
        formatted.append("PERSONAL INFORMATION:")
        for key, value in resume_data.personal_info.items():
            formatted.append(f"- {key.title()}: {value}")
        
        if resume_data.professional_summary:
            formatted.append(f"\nPROFESSIONAL SUMMARY:\n{resume_data.professional_summary}")
        
        formatted.append("\nWORK EXPERIENCE:")
        for exp in resume_data.work_experience:
            formatted.append(f"\n{exp.position} at {exp.company} ({exp.start_date} - {exp.end_date or 'Present'})")
            formatted.append("Responsibilities:")
            for resp in exp.responsibilities:
                formatted.append(f"- {resp}")
            if exp.achievements:
                formatted.append("Achievements:")
                for ach in exp.achievements:
                    formatted.append(f"- {ach}")
        
        formatted.append("\nEDUCATION:")
        for edu in resume_data.education:
            formatted.append(f"- {edu.degree} in {edu.field_of_study}, {edu.institution} ({edu.graduation_date})")
        
        if resume_data.skills:
            formatted.append("\nSKILLS:")
            for category, skills in resume_data.skills.items():
                formatted.append(f"- {category}: {', '.join(skills)}")
        
        if resume_data.projects:
            formatted.append("\nPROJECTS:")
            for project in resume_data.projects:
                formatted.append(f"- {project.name}: {project.description}")
                formatted.append(f"  Technologies: {', '.join(project.technologies)}")
        
        return "\n".join(formatted)

# Initialize components
resume_optimizer = ResumeOptimizer()
ollama_client = OllamaClient()
html_generator = HTMLResumeGenerator()

# In-memory storage
resume_store = {}



# Complete the missing endpoints and fix imports

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

# ... (all the existing classes remain the same) ...

@app.post("/api/generate-resume", response_model=ResumeResponse)
async def generate_resume(request: ResumeRequest):
    """Generate an optimized resume with HTML and optional PDF"""
    try:
        # Extract keywords from job description
        job_keywords = resume_optimizer.extract_keywords_from_job_description(
            request.job_description or ""
        )
        
        # Analyze resume content
        analysis = resume_optimizer.analyze_resume_content(
            request.resume_data, job_keywords
        )
        
        # Generate optimized resume using Ollama
        optimized_resume = ollama_client.generate_resume(
            request.resume_data, analysis, job_keywords, request.resume_format
        )
        
        # Calculate overall score
        overall_score = int((
            analysis["impact_score"] * 0.3 +
            analysis["keyword_score"] * 0.25 +
            analysis["formatting_score"] * 0.25 +
            analysis["brevity_score"] * 0.2
        ))
        
        # Generate suggestions
        suggestions = []
        if analysis["impact_score"] < 70:
            suggestions.append("Add more quantified achievements with specific metrics and numbers")
        if analysis["keyword_score"] < 70:
            suggestions.append("Include more relevant keywords from the job description")
        if analysis["formatting_score"] < 80:
            suggestions.append("Ensure all required sections are present and well-structured")
        if analysis["brevity_score"] < 70:
            suggestions.append("Optimize resume length and remove redundant information")
        
        # Generate HTML content with selected theme
        resume_id = str(uuid.uuid4())
        html_content = html_generator.generate_resume_html(
            request.resume_data, optimized_resume, analysis, resume_id, request.theme
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
        response = requests.get(f"{ollama_client.base_url}/api/tags", timeout=5)
        ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        ollama_status = "unhealthy"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ollama_status": ollama_status,
        "total_resumes": len(resume_store)
    }


# Cleanup function for temporary files (optional background task)
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