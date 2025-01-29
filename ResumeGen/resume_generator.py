import google.generativeai as genai
import os
from datetime import datetime
from fpdf import FPDF

class ResumeGenerator:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.user_info = {}
        
    def gather_user_input(self):
        """Gather basic information from the user"""
        print("\n=== Resume Information Gathering ===")
        self.user_info['name'] = input("Enter your full name: ")
        self.user_info['email'] = input("Enter your email: ")
        self.user_info['phone'] = input("Enter your phone number: ")
        
        # Education
        print("\n=== Education ===")
        print("Enter your educational background (press Enter with empty input to finish)")
        education = []
        while True:
            school = input("\nSchool name (or press Enter to finish): ")
            if not school:
                break
            degree = input("Degree and major: ")
            year = input("Graduation year: ")
            education.append({
                'school': school,
                'degree': degree,
                'year': year
            })
        self.user_info['education'] = education
        
        # Experience
        print("\n=== Work Experience ===")
        print("Enter your work experience (press Enter with empty input to finish)")
        experience = []
        while True:
            company = input("\nCompany name (or press Enter to finish): ")
            if not company:
                break
            position = input("Position title: ")
            duration = input("Duration (e.g., '2019-2021'): ")
            responsibilities = input("Brief description of responsibilities: ")
            experience.append({
                'company': company,
                'position': position,
                'duration': duration,
                'responsibilities': responsibilities
            })
        self.user_info['experience'] = experience
        
        # Achievements
        print("\n=== Achievements ===")
        achievements = input("Enter your key achievements (comma-separated): ")
        self.user_info['achievements'] = [ach.strip() for ach in achievements.split(',')]
        
        # Skills
        print("\n=== Skills ===")
        skills = input("Enter your key skills (comma-separated): ")
        self.user_info['skills'] = [skill.strip() for skill in skills.split(',')]

    def generate_content(self):
        """Generate professional content using Gemini API"""
        model = genai.GenerativeModel('gemini-pro')

        # Professional summary
        prompt = f"""Create a professional summary for a resume based on the following information:
        Name: {self.user_info['name']}
        Experience: {self.user_info['experience']}
        Skills: {self.user_info['skills']}
        Make it concise, professional, and compelling (2-3 sentences)."""

        response = model.generate_content(prompt)
        self.user_info['summary'] = response.text

        # Enhance achievement descriptions
        enhanced_achievements = []
        for achievement in self.user_info['achievements']:
            prompt = f"Transform this achievement into a powerful, quantifiable resume bullet point: {achievement}"
            response = model.generate_content(prompt)
            enhanced_achievements.append(response.text)
        self.user_info['enhanced_achievements'] = enhanced_achievements

    def create_pdf(self, output_filename="resume.pdf"):
        """Generate a PDF resume"""
        # Create PDF with UTF-8 encoding support
        pdf = FPDF()
        pdf.add_page()
        
        # Add Unicode font
        try:
            # Try to use Arial Unicode MS if available
            pdf.add_font('Arial', '', 'Arial Unicode.ttf', uni=True)
        except RuntimeError:
            # Fallback to built-in Arial with encoding
            pass
        
        # Set fonts
        pdf.set_font('Arial', 'B', 16)
        
        # Header
        pdf.cell(0, 10, self.user_info['name'], ln=True, align='C')
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 5, f"{self.user_info['email']} | {self.user_info['phone']}", ln=True, align='C')
        
        # Professional Summary
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Professional Summary', ln=True)
        pdf.set_font('Arial', '', 10)
        pdf.multi_cell(0, 5, self.user_info['summary'])
        
        # Experience
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Professional Experience', ln=True)
        for exp in self.user_info['experience']:
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(0, 5, f"{exp['company']} - {exp['position']}", ln=True)
            pdf.set_font('Arial', 'I', 10)
            pdf.cell(0, 5, exp['duration'], ln=True)
            pdf.set_font('Arial', '', 10)
            pdf.multi_cell(0, 5, exp['responsibilities'])
            pdf.ln(3)
        
        # Education
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Education', ln=True)
        for edu in self.user_info['education']:
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(0, 5, edu['school'], ln=True)
            pdf.set_font('Arial', '', 10)
            pdf.cell(0, 5, f"{edu['degree']} - {edu['year']}", ln=True)
        
        # Achievements
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Key Achievements', ln=True)
        pdf.set_font('Arial', '', 10)
        for achievement in self.user_info['enhanced_achievements']:
            # Replace bullet point with hyphen to avoid encoding issues
            pdf.multi_cell(0, 5, f"- {achievement}")
        
        # Skills
        pdf.ln(5)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Skills', ln=True)
        pdf.set_font('Arial', '', 10)
        skills_text = ", ".join(self.user_info['skills'])
        pdf.multi_cell(0, 5, skills_text)
        
        try:
            # Save PDF with error handling
            pdf.output(output_filename, 'F')
        except UnicodeEncodeError as e:
            print(f"Warning: Some special characters might not be displayed correctly: {str(e)}")
            # Attempt to save with basic character substitution
            pdf.output(output_filename)

def main():
    # Get Gemini API key from environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        api_key = input("Please enter your Gemini API key: ")
    
    # Create resume generator instance
    generator = ResumeGenerator(api_key)
    
    # Gather information
    generator.gather_user_input()
    
    # Generate enhanced content
    print("\nGenerating professional content...")
    generator.generate_content()
    
    # Create PDF
    output_filename = f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    print(f"\nGenerating PDF resume: {output_filename}")
    generator.create_pdf(output_filename)
    print(f"\nResume generated successfully! File saved as: {output_filename}")

if __name__ == "__main__":
    main()