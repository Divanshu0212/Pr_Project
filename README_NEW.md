# DevPortfolio: Developer Profile Management Platform

![Project Banner](https://via.placeholder.com/1200x400/0D1117/40E0D0?text=DevPortfolio)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

## 🚀 Quick Deploy to Render

**Ready to deploy in 5 minutes!**

1. **Fork this repository** to your GitHub account
2. **Go to [Render Dashboard](https://render.com)** and create a new Web Service
3. **Connect your GitHub repo** and select the `newbr` branch
4. **Set Environment Variables**:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   LANGCHAIN_API_KEY=your_langchain_api_key_here
   ```
5. **Deploy!** 🎉

[📖 Detailed Deployment Guide](DEPLOYMENT.md)

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Design Philosophy](#design-philosophy)
- [Contributors](#contributors)

## Project Overview

DevPortfolio is a comprehensive full-stack platform designed to empower developers in managing their professional identity. This application combines portfolio management, AI-powered resume generation, and intelligent ATS analysis into a single cohesive system. Built with modern web technologies, it demonstrates enterprise-level development practices with emphasis on scalability, performance, and user experience.

## Key Features

✨ **Portfolio Manager** - Complete developer profile management  
📄 **AI-Powered Resume Generator** - Create ATS-optimized resumes  
🔍 **ATS Compatibility Analysis** - Real-time resume scoring  
🤖 **Coding Profile Analysis** - LeetCode, Codeforces integration  
🌓 **Dark/Light Mode Toggle** - Seamless theme switching  
📱 **Fully Responsive Design** - Mobile-first approach  
🎨 **Custom Theme Support** - Personalized styling  
⚡ **Performance Optimized** - Fast loading and smooth animations  
🐳 **Docker Ready** - Containerized deployment  
☁️ **Cloud Deployment Ready** - Render, Heroku, Railway compatible

## Tech Stack

### Frontend
- **React 18** with Hooks & Suspense
- **Tailwind CSS** + Custom CSS Modules
- **GSAP** for performant animations
- **React Router DOM** for navigation
- **Vite** build tool & dev server

### Backend
- **Node.js/Express** REST API
- **FastAPI** Python microservices
- **MongoDB** document database
- **JWT** authentication
- **Cloudinary** file storage

### AI/ML Services
- **Groq LLM** for resume optimization
- **LangChain** framework
- **spaCy** NLP processing
- **scikit-learn** similarity analysis
- **Beautiful Soup** web scraping

## Installation

### Quick Start (Docker)
```bash
git clone https://github.com/Divanshu0212/Pr_Project.git
cd Pr_Project
cp .env.template .env  # Add your API keys
docker-compose up --build
```

### Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/Divanshu0212/Pr_Project.git
cd Pr_Project

# 2. Install Python dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 3. Install Node.js dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Environment setup
cp .env.template .env  # Edit with your API keys

# 5. Start all services
./start.sh
```

## API Documentation

### 🔍 ATS Analysis Service (Port 8000)
```bash
POST /analyze-resume           # Upload resume file for analysis
POST /analyze-text            # Analyze resume text directly
POST /analyze-coding-profiles # Analyze LeetCode/Codeforces profiles
GET /api/health               # Service health check
```

### 📄 Resume Generation Service (Port 8001)  
```bash
POST /api/generate-resume     # Generate AI-optimized resume
GET /api/resume/{id}          # Retrieve resume data
GET /api/resume/{id}/pdf      # Download PDF resume
GET /api/my-resumes/{user_id} # List user's resumes
DELETE /api/resume/{id}       # Delete resume
```

### 🔧 Backend API (Port 5000)
```bash
# Authentication
POST /auth/register           # User registration
POST /auth/login             # User authentication
GET /auth/profile            # User profile data

# Portfolio Management  
GET /api/portfolio           # Get portfolio data
PUT /api/portfolio           # Update portfolio
POST /api/upload            # File uploads
```

## Project Structure

```
devportfolio/
├── 📁 frontend/              # React application
│   ├── src/components/       # Reusable UI components
│   ├── src/pages/           # Route components
│   ├── src/styles/          # CSS modules & Tailwind
│   └── package.json
├── 📁 backend/              # Node.js/Express API
│   ├── routes/              # API route handlers
│   ├── models/              # Database models
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & validation
│   └── package.json
├── 🐍 ats3.py              # ATS Analysis Service
├── 🐍 temp4.py             # Resume Generation Service  
├── 📋 requirements.txt      # Python dependencies
├── 🐳 Dockerfile           # Production container
├── 🐳 Dockerfile.render    # Render-optimized image
├── 🔧 docker-compose.yml   # Development setup
├── ☁️ render.yaml          # Render deployment config
└── 🚀 start.sh             # Production startup script
```

## Design Philosophy

### 🎨 Visual Design
- **Color Palette**: Turquoise (#40E0D0), Navy (#0D1117), Purple (#9C27B0)
- **Typography**: Clean, readable fonts with proper hierarchy
- **Animations**: GSAP-powered, performance-optimized
- **Responsive**: Mobile-first, adaptive layouts

### 🔧 Technical Principles
- **Microservices Architecture**: Scalable, maintainable services
- **API-First Design**: RESTful interfaces
- **Performance**: Lazy loading, code splitting, caching
- **Security**: JWT auth, input validation, CORS protection
- **Accessibility**: WCAG 2.1 compliant

## Contributors

👨‍💻 **Divanshu** - Full-Stack Developer & Project Lead  
🚀 Repository: [Pr_Project](https://github.com/Divanshu0212/Pr_Project)

---

<div align="center">
  <p><strong>🌟 Star this repo if you found it helpful!</strong></p>
  <sub>Built with ❤️ for the developer community | 2025</sub>
</div>
