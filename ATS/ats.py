# File: ats_resume_system.py

import pandas as pd
from datetime import datetime
import re
from collections import Counter
import os
import PyPDF2
import docx
from typing import Dict, List, Tuple
import json
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import sys

class ResumeATSScorer:
    def __init__(self):
        self.submissions = pd.DataFrame(columns=[
            'date', 'company', 'position', 'ats_score', 'format_score',
            'keyword_score', 'section_score', 'details', 'status', 'notes'
        ])
        
        # Common section headers in resumes
        self.expected_sections = {
            'education': ['education', 'academic background', 'qualifications'],
            'experience': ['experience', 'work experience', 'professional experience', 'employment history'],
            'skills': ['skills', 'technical skills', 'core competencies', 'expertise'],
            'contact': ['contact', 'contact information', 'personal information']
        }
        
    def read_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
    
    def read_docx(self, docx_path: str) -> str:
        """Extract text from a DOCX file."""
        try:
            doc = docx.Document(docx_path)
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
            
    def analyze_format(self, text: str) -> Tuple[float, Dict]:
        """Analyze resume format and structure."""
        format_issues = []
        score = 100.0
        
        # Check for common formatting issues
        if len(text.split('\n\n')) < 3:
            score -= 10
            format_issues.append("Insufficient spacing between sections")
            
        if len(re.findall(r'[A-Z]{4,}', text)) > 5:
            score -= 5
            format_issues.append("Too many words in all caps")
            
        if len(re.findall(r'•|›|»|∙|◦', text)) > 20:
            score -= 5
            format_issues.append("Excessive use of bullet points")
            
        return max(0, score), format_issues
        
    def analyze_sections(self, text: str) -> Tuple[float, Dict]:
        """Analyze presence and organization of standard resume sections."""
        text_lower = text.lower()
        found_sections = []
        missing_sections = []
        score = 100.0
        
        for section, variants in self.expected_sections.items():
            section_found = False
            for variant in variants:
                if variant in text_lower:
                    section_found = True
                    found_sections.append(section)
                    break
            if not section_found:
                missing_sections.append(section)
                score -= 25  # Deduct points for each missing major section
                
        return max(0, score), {
            'found_sections': found_sections,
            'missing_sections': missing_sections
        }
    
    def analyze_keywords(self, resume_text: str, job_description: str) -> Tuple[float, Dict]:
        """Analyze keyword matches between resume and job description."""
        # Extract keywords from both texts
        job_keywords = self.extract_keywords(job_description)
        resume_keywords = self.extract_keywords(resume_text)
        
        # Calculate match statistics
        job_terms = set(job_keywords.keys())
        resume_terms = set(resume_keywords.keys())
        matches = job_terms.intersection(resume_terms)
        missing_keywords = job_terms - resume_terms
        
        # Calculate score
        match_rate = (len(matches) / len(job_terms)) * 100 if job_terms else 0
        
        return match_rate, {
            'matched_keywords': list(matches),
            'missing_keywords': list(missing_keywords),
            'match_percentage': round(match_rate, 2)
        }
    
    def extract_keywords(self, text: str) -> Counter:
        """Extract important keywords from text."""
        words = text.lower().split()
        common_words = {'and', 'the', 'is', 'in', 'at', 'of', 'to', 'for', 'a', 'with'}
        keywords = [re.sub(r'[^a-z]', '', word) for word in words]
        keywords = [word for word in keywords if word and word not in common_words]
        return Counter(keywords)
    
    def score_resume(self, resume_path: str, job_description: str) -> Dict:
        """Analyze a resume and provide comprehensive ATS scoring."""
        # Read resume based on file type
        if resume_path.lower().endswith('.pdf'):
            resume_text = self.read_pdf(resume_path)
        elif resume_path.lower().endswith('.docx'):
            resume_text = self.read_docx(resume_path)
        else:
            raise ValueError("Unsupported file format. Please provide PDF or DOCX file.")
        
        # Perform analyses
        format_score, format_details = self.analyze_format(resume_text)
        section_score, section_details = self.analyze_sections(resume_text)
        keyword_score, keyword_details = self.analyze_keywords(resume_text, job_description)
        
        # Calculate overall score
        overall_score = (
            format_score * 0.3 +    # Format is 30% of score
            section_score * 0.3 +    # Section organization is 30% of score
            keyword_score * 0.4      # Keyword matching is 40% of score
        )
        
        return {
            'overall_score': round(overall_score, 2),
            'format_score': round(format_score, 2),
            'section_score': round(section_score, 2),
            'keyword_score': round(keyword_score, 2),
            'details': {
                'format_issues': format_details,
                'section_analysis': section_details,
                'keyword_analysis': keyword_details
            }
        }

class ATSGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Resume ATS Analyzer")
        self.scorer = ResumeATSScorer()
        self.resume_path = None
        self.setup_gui()

    def setup_gui(self):
        # Create main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Resume selection
        ttk.Label(main_frame, text="Resume:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.resume_label = ttk.Label(main_frame, text="No file selected")
        self.resume_label.grid(row=0, column=1, sticky=tk.W, pady=5)
        ttk.Button(main_frame, text="Browse", command=self.browse_resume).grid(row=0, column=2, pady=5)

        # Job description
        ttk.Label(main_frame, text="Job Description:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.job_desc = tk.Text(main_frame, height=10, width=50)
        self.job_desc.grid(row=1, column=1, columnspan=2, pady=5)

        # Company and position
        ttk.Label(main_frame, text="Company:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.company_entry = ttk.Entry(main_frame)
        self.company_entry.grid(row=2, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Position:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.position_entry = ttk.Entry(main_frame)
        self.position_entry.grid(row=3, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        # Analyze button
        ttk.Button(main_frame, text="Analyze Resume", command=self.analyze_resume).grid(row=4, column=0, columnspan=3, pady=20)

        # Results
        self.result_text = tk.Text(main_frame, height=15, width=50)
        self.result_text.grid(row=5, column=0, columnspan=3, pady=5)

    def browse_resume(self):
        self.resume_path = filedialog.askopenfilename(
            filetypes=[("Resume files", "*.pdf;*.docx"), ("All files", "*.*")]
        )
        if self.resume_path:
            self.resume_label.config(text=os.path.basename(self.resume_path))

    def analyze_resume(self):
        if not self.resume_path:
            messagebox.showerror("Error", "Please select a resume file")
            return

        job_description = self.job_desc.get("1.0", tk.END).strip()
        if not job_description:
            messagebox.showerror("Error", "Please enter a job description")
            return

        try:
            analysis = self.scorer.score_resume(self.resume_path, job_description)
            
            # Format results
            result = f"""
ATS Analysis Results:
--------------------
Overall Score: {analysis['overall_score']}%
Format Score: {analysis['format_score']}%
Section Score: {analysis['section_score']}%
Keyword Score: {analysis['keyword_score']}%

Format Issues:
{chr(10).join(analysis['details']['format_issues'])}

Missing Sections:
{chr(10).join(analysis['details']['section_analysis']['missing_sections'])}

Keyword Analysis:
- Matched Keywords: {', '.join(analysis['details']['keyword_analysis']['matched_keywords'])}
- Missing Keywords: {', '.join(analysis['details']['keyword_analysis']['missing_keywords'])}
"""
            self.result_text.delete("1.0", tk.END)
            self.result_text.insert("1.0", result)

            # Add to submissions if company and position are provided
            company = self.company_entry.get().strip()
            position = self.position_entry.get().strip()
            if company and position:
                self.scorer.submissions = pd.concat([
                    self.scorer.submissions,
                    pd.DataFrame([{
                        'date': datetime.now(),
                        'company': company,
                        'position': position,
                        'ats_score': analysis['overall_score'],
                        'format_score': analysis['format_score'],
                        'keyword_score': analysis['keyword_score'],
                        'section_score': analysis['section_score'],
                        'details': json.dumps(analysis['details']),
                        'status': 'Analyzed',
                        'notes': ''
                    }])
                ], ignore_index=True)

        except Exception as e:
            messagebox.showerror("Error", str(e))

def main():
    root = tk.Tk()
    app = ATSGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()