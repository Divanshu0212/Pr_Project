import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from '../../services/atsService';
import Button from '../common/Button';
import Card from '../common/Card';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (formRef.current) observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please upload a resume');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const uploadResponse = { id: 'mock-upload-id-' + Date.now() };
      const analysisId = await analyzeResume(uploadResponse.id, jobDescription);

      navigate(`/ats/analysis/${analysisId}`);
    } catch (err) {
      setError(err.message || 'Failed to process resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={formRef} className="opacity-0">
      <Card className="backdrop-blur-sm bg-gradient-card-dark border border-accent-neutral/20">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in-down">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent animate-gradient-x">
              📄 Upload Your Resume
            </h2>
            <p className="text-text-secondary mt-2"> Let's analyze your resume for ATS compatibility</p>
          </div>

          {/* File Upload Area */}
          <div className="animate-fade-in-up animation-delay-200">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-400 group overflow-hidden ${
                dragActive 
                  ? 'border-accent-primary bg-gradient-hero shadow-glow scale-105' 
                  : file 
                    ? 'border-accent-secondary bg-gradient-hero shadow-card hover:shadow-glow' 
                    : 'border-accent-neutral/30 hover:border-accent-primary/50 hover:bg-gradient-hero hover:shadow-card'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              {/* Background gradient mesh */}
              <div className="absolute inset-0 bg-gradient-mesh opacity-20 animate-pulse-slow"></div>
              
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                {/* Upload Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-400 ${
                  file ? 'bg-gradient-to-r from-accent-secondary to-accent-primary animate-bounce-gentle' : 'bg-accent-neutral/20 group-hover:bg-accent-primary/20'
                }`}>
                  {file ? (
                    <svg className="w-8 h-8 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-accent-primary group-hover:animate-bounce-gentle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-text-primary text-lg font-semibold">
                    {file ? (
                      <span className="text-accent-secondary animate-fade-in-left">{file.name}</span>
                    ) : (
                      'Drag & drop your resume here'
                    )}
                  </h3>

                  <p className="text-text-secondary text-sm">
                    {file ? (
                      <span className="animate-fade-in-right">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    ) : (
                      'or click to browse (PDF, DOC, DOCX)'
                    )}
                  </p>

                  {file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-sm text-accent-error hover:text-accent-primary transition-colors duration-300 animate-fade-in-up"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="animate-fade-in-up animation-delay-300">
            <label htmlFor="job-description" className="block text-text-primary font-medium mb-3">
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Job Description (Optional)
              </span>
            </label>
            <div className="relative">
              <textarea
                id="job-description"
                rows="6"
                placeholder="Paste job description to get more accurate analysis..."
                className="w-full bg-background-secondary/50 border border-accent-neutral/20 rounded-xl p-4 text-text-primary placeholder-text-placeholder focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-400 backdrop-blur-sm resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 text-xs text-text-secondary">
                {jobDescription.length}/2000
              </div>
            </div>
            <p className="mt-2 text-sm text-text-secondary animate-fade-in-left animation-delay-400">
              💡 Adding a job description helps us match your resume to specific requirements
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="animate-fade-in-up bg-accent-error/10 border border-accent-error/20 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-accent-error/20 flex items-center justify-center">
                  <span className="text-accent-error text-xs">!</span>
                </div>
                <span className="text-accent-error text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="animate-fade-in-up animation-delay-500">
            <Button
              text={isLoading ? 'Processing...' : 'Analyze Resume'}
              onClick={handleSubmit}
              disabled={isLoading || !file}
              className={`w-full py-4 text-lg font-semibold transition-all duration-400 ${
                isLoading || !file
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 hover:shadow-glow'
              }`}
            />
            
            {isLoading && (
              <div className="flex items-center justify-center mt-4 space-x-2 animate-fade-in-up">
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce animation-delay-200"></div>
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UploadForm;