// src/services/resumeService.js

import { storage } from '../utils/storage';

// Mock data for development - Replace with actual API calls in production
const mockTemplates = [
  {
    id: 'modern-1',
    name: 'Modern Professional',
    description: 'Clean and professional design with accent colors and modern typography',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/00FFFF?text=Modern+Professional',
    category: 'professional',
    popular: true
  },
  {
    id: 'creative-1',
    name: 'Creative Portfolio',
    description: 'Stand out with unique layout elements and vibrant accent colors',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/9C27B0?text=Creative+Portfolio',
    category: 'creative',
    popular: true
  },
  {
    id: 'minimal-1',
    name: 'Minimal Clean',
    description: 'Streamlined design focusing on content with elegant typography',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/E5E5E5?text=Minimal+Clean',
    category: 'minimal',
    popular: false
  },
  {
    id: 'academic-1',
    name: 'Academic CV',
    description: 'Traditional format optimized for academic and research positions',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/4299E1?text=Academic+CV',
    category: 'academic',
    popular: false
  },
  {
    id: 'tech-1',
    name: 'Tech Specialist',
    description: 'Designed for tech roles with sections for projects and technical skills',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/48BB78?text=Tech+Specialist',
    category: 'professional',
    popular: true
  },
  {
    id: 'executive-1',
    name: 'Executive Resume',
    description: 'Sophisticated design for senior management and executive positions',
    thumbnail: 'https://via.placeholder.com/300x400/161B22/F6AD55?text=Executive+Resume',
    category: 'professional',
    popular: false
  }
];

// Simulated user's saved resumes
const mockUserResumes = [
  {
    id: 'resume-1',
    name: 'Software Developer Resume',
    templateId: 'modern-1',
    createdAt: '2025-03-15T10:30:00Z',
    updatedAt: '2025-03-20T14:45:00Z',
    previewUrl: 'https://via.placeholder.com/800x1100/161B22/00FFFF?text=Resume+Preview'
  },
  {
    id: 'resume-2',
    name: 'Freelance Portfolio',
    templateId: 'creative-1',
    createdAt: '2025-02-10T08:15:00Z',
    updatedAt: '2025-02-10T08:15:00Z',
    previewUrl: 'https://via.placeholder.com/800x1100/161B22/9C27B0?text=Resume+Preview'
  }
];

class ResumeService {
  constructor() {
    this.endpoints = {
      templates: '/api/resume/templates',
      resumes: '/api/resume',
      generate: '/api/resume/generate',
      download: '/api/resume/download'
    };
    
    // Initialize from local storage or use mock data
    this.templates = storage.get('resume_templates') || mockTemplates;
    this.userResumes = storage.get('user_resumes') || mockUserResumes;
  }
  
  // Get all resume templates
  async getTemplates() {
    try {
      // In production, use API call
      // const response = await fetch(this.endpoints.templates);
      // return response.json();
      
      // For development, use mock data
      return Promise.resolve(this.templates);
    } catch (error) {
      console.error('Error fetching resume templates:', error);
      throw error;
    }
  }
  
  // Get templates by category
  async getTemplatesByCategory(category) {
    try {
      const templates = await this.getTemplates();
      return templates.filter(template => template.category === category);
    } catch (error) {
      console.error(`Error fetching templates for category ${category}:`, error);
      throw error;
    }
  }
  
  // Get popular templates
  async getPopularTemplates() {
    try {
      const templates = await this.getTemplates();
      return templates.filter(template => template.popular);
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }
  }
  
  // Get template by ID
  async getTemplateById(templateId) {
    try {
      const templates = await this.getTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }
      
      return template;
    } catch (error) {
      console.error(`Error fetching template with ID ${templateId}:`, error);
      throw error;
    }
  }
  
  // Get user's saved resumes
  async getUserResumes(userId) {
    try {
      // In production, use API call with userId
      // const response = await fetch(`${this.endpoints.resumes}/user/${userId}`);
      // return response.json();
      
      // For development, use mock data
      return Promise.resolve(this.userResumes);
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      throw error;
    }
  }
  
  // Generate a resume
  async generateResume(resumeData) {
    try {
      // In production, use API call
      // const response = await fetch(this.endpoints.generate, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(resumeData)
      // });
      // return response.json();
      
      // For development, simulate API call with timeout
      return new Promise(resolve => {
        setTimeout(() => {
          const generatedResume = {
            id: `resume-${Date.now()}`,
            name: 'New Resume',
            templateId: resumeData.template.id,
            previewUrl: resumeData.template.thumbnail.replace('300x400', '800x1100'),
            createdAt: new Date().toISOString(),
            data: resumeData
          };
          
          resolve(generatedResume);
        }, 1500); // Simulate processing time
      });
    } catch (error) {
      console.error('Error generating resume:', error);
      throw error;
    }
  }
  
  // Save a resume
  async saveResume(resumeData) {
    try {
      // In production, use API call
      // const response = await fetch(this.endpoints.resumes, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(resumeData)
      // });
      // return response.json();
      
      // For development, save to mock data and local storage
      const newResume = {
        id: `resume-${Date.now()}`,
        name: resumeData.name,
        templateId: resumeData.templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previewUrl: resumeData.previewUrl || 'https://via.placeholder.com/800x1100/161B22/00FFFF?text=Resume+Preview',
        data: resumeData.data
      };
      
      this.userResumes.push(newResume);
      storage.set('user_resumes', this.userResumes);
      
      return Promise.resolve(newResume);
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }
  
  // Update a resume
  async updateResume(resumeId, updatedData) {
    try {
      // In production, use API call
      // const response = await fetch(`${this.endpoints.resumes}/${resumeId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(updatedData)
      // });
      // return response.json();
      
      // For development, update mock data and local storage
      const index = this.userResumes.findIndex(resume => resume.id === resumeId);
      
      if (index === -1) {
        throw new Error(`Resume with ID ${resumeId} not found`);
      }
      
      this.userResumes[index] = {
        ...this.userResumes[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      storage.set('user_resumes', this.userResumes);
      
      return Promise.resolve(this.userResumes[index]);
    } catch (error) {
      console.error(`Error updating resume with ID ${resumeId}:`, error);
      throw error;
    }
  }
  
  // Delete a resume
  async deleteResume(resumeId) {
    try {
      // In production, use API call
      // await fetch(`${this.endpoints.resumes}/${resumeId}`, {
      //   method: 'DELETE'
      // });
      
      // For development, update mock data and local storage
      const index = this.userResumes.findIndex(resume => resume.id === resumeId);
      
      if (index === -1) {
        throw new Error(`Resume with ID ${resumeId} not found`);
      }
      
      this.userResumes.splice(index, 1);
      storage.set('user_resumes', this.userResumes);
      
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error(`Error deleting resume with ID ${resumeId}:`, error);
      throw error;
    }
  }
  
  // Download a resume
  async downloadResume(resumeId, format = 'pdf') {
    try {
      // In a real application, this would redirect to a download URL or trigger a file download
      console.log(`Downloading resume ${resumeId} in ${format} format`);
      
      // Simulate download success
      return Promise.resolve({
        success: true,
        message: `Resume downloaded in ${format.toUpperCase()} format`
      });
    } catch (error) {
      console.error(`Error downloading resume with ID ${resumeId}:`, error);
      throw error;
    }
  }
}

export const resumeService = new ResumeService();