# Portfolio Project Deployment Guide

This full-stack application includes:
- **Frontend**: React/Vite application
- **Backend**: Node.js/Express server
- **ATS Service**: Python FastAPI service (ats3.py) 
- **Resume Generator**: Python FastAPI service (temp4.py)

## 🚀 Quick Deploy to Render

### Option 1: Automatic Deploy (Recommended)

1. **Fork/Clone this repository** to your GitHub account

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `newbr` branch

3. **Configure Environment Variables**:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   LANGCHAIN_API_KEY=your_langchain_api_key_here
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT=Portfolio_ATS
   NODE_ENV=production
   ```

4. **Deployment Settings**:
   - **Build Command**: `chmod +x start.sh && pip install -r requirements.txt && python -m spacy download en_core_web_sm && cd backend && npm ci && cd ../frontend && npm ci && npm run build`
   - **Start Command**: `./start.sh`
   - **Dockerfile Path**: `Dockerfile.render`

### Option 2: Using render.yaml

1. **Push the render.yaml file** to your repository
2. **Connect to Render** and it will automatically detect the configuration
3. **Set environment variables** in Render dashboard

## 🐳 Docker Deployment

### Local Development
```bash
# Clone the repository
git clone https://github.com/Divanshu0212/Pr_Project.git
cd Pr_Project

# Copy environment template
cp .env.template .env
# Edit .env with your API keys

# Run with Docker Compose
docker-compose up --build
```

### Production Docker Build
```bash
# Build the image
docker build -f Dockerfile.render -t portfolio-app .

# Run the container
docker run -p 10000:10000 \
  -e GROQ_API_KEY=your_key \
  -e LANGCHAIN_API_KEY=your_key \
  portfolio-app
```

## 🔧 Manual Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Setup Steps

1. **Clone and Install**:
   ```bash
   git clone https://github.com/Divanshu0212/Pr_Project.git
   cd Pr_Project
   
   # Install Python dependencies
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   
   # Install Node.js dependencies
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Environment Setup**:
   ```bash
   cp .env.template .env
   # Edit .env with your API keys
   ```

4. **Start Services**:
   ```bash
   # Start all services
   ./start.sh
   
   # Or start individually:
   # Backend: cd backend && npm start
   # ATS: python3 ats3.py  
   # Resume: python3 temp4.py
   ```

## 🌐 Service URLs

After deployment, your services will be available at:
- **Main Application**: `https://your-app.onrender.com`
- **Backend API**: `https://your-app.onrender.com:5000`
- **ATS API**: `https://your-app.onrender.com:8000`
- **Resume API**: `https://your-app.onrender.com:8001`

## 📋 Environment Variables

### Required
- `GROQ_API_KEY`: Your Groq API key for AI services
- `LANGCHAIN_API_KEY`: LangChain API key for tracing

### Optional
- `NODE_ENV`: Set to "production" for production
- `PORT`: Main application port (default: 10000)
- `ATS_PORT`: ATS service port (default: 8000)
- `RESUME_PORT`: Resume service port (default: 8001)

## 🔍 Health Checks

- Backend: `GET /health`
- ATS Service: `GET /api/health`
- Resume Service: `GET /api/health`

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure all environment variables are set
   - Check Node.js and Python versions
   - Verify API keys are valid

2. **Port Conflicts**:
   - Update port environment variables
   - Check if ports are available

3. **Dependency Issues**:
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Update Python packages: `pip install -r requirements.txt --upgrade`

### Logs
Check Render logs in the dashboard for detailed error information.

## 📚 API Documentation

### ATS Service (`/api/`)
- `POST /analyze-resume`: Upload and analyze resume
- `POST /analyze-text`: Analyze resume text
- `POST /analyze-coding-profiles`: Analyze coding profiles

### Resume Service (`/api/`)
- `POST /generate-resume`: Generate optimized resume
- `GET /resume/{id}`: Get resume data
- `GET /resume/{id}/pdf`: Download PDF resume

## 🚀 Alternative Deployment Platforms

### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku stack:set container
git push heroku main
```

### Railway
```bash
# Install Railway CLI
railway login
railway new
railway link
railway up
```

### DigitalOcean App Platform
Use the `Dockerfile.render` for container deployment.

## 📞 Support

For deployment issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Ensure API keys are valid and have sufficient credits
4. Check the GitHub repository for updates

---

**Note**: Make sure to update the repository URL and environment variables according to your specific setup.
