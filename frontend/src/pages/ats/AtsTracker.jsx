import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import UploadForm from '../../components/ats/UploadForm';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

// Placeholder for the backend analysis function
const analyzeResumeOnBackend = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription);

  const response = await fetch('http://localhost:8080/api/analyze-resume', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Analysis failed on the backend');
  }

  const result = await response.json();
  return result.analysisId;
};

const AtsTracker = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleResumeUpload = (file) => {
    setResumeFile(file);
    setError('');
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    try {
      const analysisId = await analyzeResumeOnBackend(resumeFile, jobDescription);
      navigate(`/ats/analysis/${analysisId}`);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { icon: <Upload className="w-5 h-5" />, text: "Upload your resume (PDF recommended)" },
    { icon: <FileText className="w-5 h-5" />, text: "Paste the job description" },
    { icon: <Target className="w-5 h-5" />, text: "Get ATS compatibility analysis" },
    { icon: <Zap className="w-5 h-5" />, text: "Receive improvement recommendations" }
  ];

  if (isLoading) {
    return <LoadingState message="Analyzing your resume against ATS criteria..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div 
          id="header" 
          data-animate
          className={`mb-8 text-center transition-all duration-800 ${
            isVisible.header ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-mesh opacity-20 blur-2xl"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-accent-primary via-accent-secondary to-purple-500 bg-clip-text text-transparent">
                  ATS Resume Analyzer
                </span>
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Upload your resume and job description to get detailed ATS compatibility analysis 
                and actionable improvement suggestions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div 
            id="error" 
            data-animate
            className={`mb-6 transition-all duration-500 ${
              isVisible.error ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'
            }`}
          >
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Main Upload Section */}
        <div 
          id="upload-section" 
          data-animate
          className={`mb-8 transition-all duration-800 delay-200 ${
            isVisible['upload-section'] ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center mr-4">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Upload Your Resume</h2>
              </div>
              
              <UploadForm onFileUpload={handleResumeUpload} />

              <div className="mt-8">
                <label className="flex items-center text-text-primary mb-4 text-lg font-semibold" htmlFor="jobDescription">
                  <FileText className="w-5 h-5 mr-2 text-accent-primary" />
                  Job Description
                </label>
                <div className="relative">
                  <textarea
                    id="jobDescription"
                    className="w-full bg-background-secondary border-2 border-accent-neutral/30 rounded-xl p-4 text-text-primary min-h-[200px] resize-y focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-300"
                    placeholder="Paste the complete job description here including requirements, qualifications, and responsibilities..."
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-sm text-text-secondary mt-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-accent-primary" />
                  For best results, paste the entire job description including requirements and qualifications.
                </p>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  text={
                    <span className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Resume
                    </span>
                  }
                  onClick={handleSubmit}
                  disabled={!resumeFile || !jobDescription.trim()}
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow transform hover:scale-105 transition-all duration-300 px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works Section */}
        <div 
          id="how-it-works" 
          data-animate
          className={`transition-all duration-800 delay-400 ${
            isVisible['how-it-works'] ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'
          }`}
        >
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-8 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-accent-primary" />
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent-secondary to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-text-primary font-medium leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AtsTracker;