from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import json
from fpdf import FPDF
import ollama
import zipfile
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # Go up one level
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

class ModernResume(FPDF):
    """Modern resume with a blue accent color."""
    def __init__(self):
        super().__init__()
        self.primary_color = (51, 51, 51)  # Dark gray
        self.accent_color = (41, 128, 185)  # Blue
        self.light_gray = (128, 128, 128)

class DarkThemeResume(FPDF):
    """Dark-themed resume with a black background and white text."""
    def __init__(self):
        super().__init__()
        self.primary_color = (255, 255, 255)  # White text
        self.accent_color = (41, 128, 185)  # Blue
        self.light_gray = (200, 200, 200)
        self.set_fill_color(0, 0, 0)  # Black background

    def header(self):
        self.rect(0, 0, self.w, self.h, 'F')

class MinimalistResume(FPDF):
    """Minimalist black-and-white resume with a clean layout."""
    def __init__(self):
        super().__init__()
        self.primary_color = (0, 0, 0)  # Black text
        self.accent_color = (0, 0, 0)  # Black section headers
        self.light_gray = (128, 128, 128)

def create_resume(pdf, user_info, output_filename):
    """Generate a resume based on the given PDF template."""
    pdf.add_page()
    pdf.set_margins(10, 10, 10)

    # Header
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(*pdf.primary_color)
    pdf.cell(0, 15, user_info['name'], ln=True, align='C')

    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(*pdf.light_gray)
    contact_info = f"Email: {user_info['email']} | Phone: {user_info['phone']}"
    pdf.cell(0, 5, contact_info, ln=True, align='C')

    # Summary
    pdf.ln(10)
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(*pdf.accent_color)
    pdf.cell(0, 10, 'PROFESSIONAL SUMMARY', ln=True)
    pdf.set_text_color(*pdf.primary_color)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 5, user_info['summary'])

    # Experience
    pdf.ln(8)
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(*pdf.accent_color)
    pdf.cell(0, 10, 'PROFESSIONAL EXPERIENCE', ln=True)
    for exp in user_info['experience']:
        pdf.set_font('Arial', 'B', 11)
        pdf.set_text_color(*pdf.primary_color)
        pdf.cell(0, 6, exp['position'], ln=True)

        pdf.set_font('Arial', 'B', 10)
        pdf.set_text_color(*pdf.light_gray)
        pdf.cell(0, 5, exp['company'], ln=True)

        pdf.set_font('Arial', 'I', 9)
        pdf.cell(0, 5, exp['duration'], ln=True)

        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(*pdf.primary_color)
        pdf.multi_cell(0, 5, exp['responsibilities'])
        pdf.ln(3)

    # Education
    pdf.ln(8)
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(*pdf.accent_color)
    pdf.cell(0, 10, 'EDUCATION', ln=True)
    for edu in user_info['education']:
        pdf.set_font('Arial', 'B', 10)
        pdf.set_text_color(*pdf.primary_color)
        pdf.cell(0, 5, edu['school'], ln=True)

        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(*pdf.light_gray)
        pdf.cell(0, 5, f"{edu['degree']} - {edu['year']}", ln=True)
        pdf.ln(2)

    # Achievements
    pdf.ln(8)
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(*pdf.accent_color)
    pdf.cell(0, 10, 'KEY ACHIEVEMENTS', ln=True)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(*pdf.primary_color)
    for achievement in user_info['enhanced_achievements']:
        pdf.cell(5, 5, "-", ln=0)
        pdf.cell(0, 5, achievement, ln=True)

    # Skills
    pdf.ln(8)
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(*pdf.accent_color)
    pdf.cell(0, 10, 'SKILLS', ln=True)
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(0, 5, " | ".join(user_info['skills']))

    pdf.output(output_filename)
    print(f"Resume saved as: {output_filename}")

class ResumeGenerator:
    def __init__(self):
        self.user_info = {}

    def gather_user_input(self, data):
        """Populate user_info dictionary based on incoming JSON data."""
        self.user_info['name'] = data['name']
        self.user_info['email'] = data['email']
        self.user_info['phone'] = data['phone']
        self.user_info['education'] = data['education']
        self.user_info['experience'] = data['experience']
        self.user_info['achievements'] = data['achievements']
        self.user_info['skills'] = data['skills']

    def generate_content(self):
        """Generate professional content using a local Ollama model."""
        print("Generating Content....")
        model_name = "mistral"
        prompt = f"""Create a professional summary for a resume:
        Name: {self.user_info['name']}
        Experience: {self.user_info['experience']}
        Skills: {self.user_info['skills']}"""
        
        response = ollama.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
        self.user_info['summary'] = response['message']['content']

        enhanced_achievements = []
        for achievement in self.user_info['achievements']:
            prompt = f"Make this achievement into a strong resume bullet point: {achievement}"
            response = ollama.chat(model=model_name, messages=[{"role": "user", "content": prompt}])
            enhanced_achievements.append(response['message']['content'])
        
        self.user_info['enhanced_achievements'] = enhanced_achievements

    def generate_resumes(self, timestamp):
        """Generate resumes in different styles."""
        print("Generating PDFs....")
        create_resume(ModernResume(), self.user_info, f"output/modern_resume_{timestamp}.pdf")
        create_resume(DarkThemeResume(), self.user_info, f"output/dark_resume_{timestamp}.pdf")
        create_resume(MinimalistResume(), self.user_info, f"output/minimalist_resume_{timestamp}.pdf")

@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    try:
        data = request.json
        generator = ResumeGenerator()
        generator.gather_user_input(data)
        generator.generate_content()

        # Generate timestamp for unique filenames
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        # Generate the resumes and store in the output folder
        generator.generate_resumes(timestamp)

        # Construct absolute file paths
        resume_files = [
            os.path.join(OUTPUT_DIR, f"modern_resume_{timestamp}.pdf"),
            os.path.join(OUTPUT_DIR, f"dark_resume_{timestamp}.pdf"),
            os.path.join(OUTPUT_DIR, f"minimalist_resume_{timestamp}.pdf"),
        ]

        # Ensure all files exist
        for file in resume_files:
            if not os.path.exists(file):
                return jsonify({'error': f"File not found: {file}"}), 500

        # Create a ZIP file containing all three resumes
        zip_filename = os.path.join(OUTPUT_DIR, f"resumes_{timestamp}.zip")
        with zipfile.ZipFile(zip_filename, 'w') as zipf:
            for file in resume_files:
                zipf.write(file, os.path.basename(file))  # Add files to ZIP

        # Check if ZIP exists before sending
        if not os.path.exists(zip_filename):
            return jsonify({'error': 'ZIP file not found'}), 500

        # Send the ZIP file as a response
        return send_file(zip_filename, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    os.makedirs('output', exist_ok=True)
    app.run(port=4000, debug=True)
