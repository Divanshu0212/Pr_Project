import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeResume } from '../../services/atsService';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Card from '../common/Card';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
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

  const themeClasses = {
    container: `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`,
    card: `backdrop-blur-sm ${isDark ? 'bg-[#161B22]/90 border-[#30363d]/30' : 'bg-white/90 border-gray-200/30'} border rounded-2xl shadow-xl`,
    title: `text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-[#00FFFF] via-[#9C27B0] to-[#00FFFF]' : 'from-[#3182CE] via-[#805AD5] to-[#3182CE]'} bg-clip-text text-transparent animate-gradient-x`,
    subtitle: `${isDark ? 'text-[#E5E5E5]/70' : 'text-gray-600'} mt-2`,
    dragArea: `relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 group overflow-hidden ${
      dragActive 
        ? `${isDark ? 'border-[#00FFFF] bg-[#00FFFF]/10' : 'border-[#3182CE] bg-[#3182CE]/10'} shadow-lg scale-105` 
        : file 
          ? `${isDark ? 'border-[#9C27B0] bg-gradient-to-br from-[#9C27B0]/10 to-[#00FFFF]/10' : 'border-[#805AD5] bg-gradient-to-br from-[#805AD5]/10 to-[#3182CE]/10'} shadow-lg hover:shadow-xl` 
          : `${isDark ? 'border-[#30363d] hover:border-[#00FFFF]/50 hover:bg-[#00FFFF]/5' : 'border-gray-300 hover:border-[#3182CE]/50 hover:bg-[#3182CE]/5'} hover:shadow-md`
    }`,
    uploadIcon: `w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
      file 
        ? `${isDark ? 'bg-gradient-to-r from-[#9C27B0] to-[#00FFFF]' : 'bg-gradient-to-r from-[#805AD5] to-[#3182CE]'} animate-pulse shadow-lg` 
        : `${isDark ? 'bg-[#30363d] group-hover:bg-[#00FFFF]/20' : 'bg-gray-100 group-hover:bg-[#3182CE]/20'}`
    }`,
    uploadText: `${isDark ? 'text-[#E5E5E5]' : 'text-gray-900'} text-lg font-semibold`,
    uploadSubtext: `${isDark ? 'text-[#E5E5E5]/60' : 'text-gray-600'} text-sm`,
    textarea: `w-full ${isDark ? 'bg-[#0D1117]/50 border-[#30363d] text-[#E5E5E5] placeholder-[#7D8590] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20' : 'bg-gray-50/50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#3182CE] focus:ring-[#3182CE]/20'} border rounded-xl p-4 focus:outline-none focus:ring-2 transition-all duration-400 backdrop-blur-sm resize-none`,
    label: `block ${isDark ? 'text-[#E5E5E5]' : 'text-gray-900'} font-medium mb-3`,
    labelGradient: `bg-gradient-to-r ${isDark ? 'from-[#00FFFF] to-[#9C27B0]' : 'from-[#3182CE] to-[#805AD5]'} bg-clip-text text-transparent`,
    errorContainer: `animate-fade-in-up ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border rounded-xl p-4`,
    errorIcon: `w-5 h-5 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'} flex items-center justify-center`,
    errorText: `${isDark ? 'text-red-400' : 'text-red-600'} text-sm font-medium`,
    hint: `mt-2 text-sm ${isDark ? 'text-[#E5E5E5]/60' : 'text-gray-600'} animate-fade-in-left`,
    charCount: `absolute bottom-3 right-3 text-xs ${isDark ? 'text-[#E5E5E5]/50' : 'text-gray-500'}`
  };

  return (
    <div ref={formRef} className={themeClasses.container}>
      <Card className={themeClasses.card}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in-down">
            <h2 className={themeClasses.title}>
              📄 Upload Your Resume
            </h2>
            <p className={themeClasses.subtitle}>
              Let's analyze your resume for ATS compatibility
            </p>
          </div>

          {/* File Upload Area */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div
              className={themeClasses.dragArea}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-upload').click()}
            >
              {/* Background gradient mesh */}
              <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#00FFFF]/5 via-transparent to-[#9C27B0]/5' : 'bg-gradient-to-br from-[#3182CE]/5 via-transparent to-[#805AD5]/5'} opacity-20 animate-pulse`}></div>
              
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                {/* Upload Icon */}
                <div className={themeClasses.uploadIcon}>
                  {file ? (
                    <svg className="w-8 h-8 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className={`w-8 h-8 ${isDark ? 'text-[#00FFFF]' : 'text-[#3182CE]'} group-hover:animate-bounce`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className={themeClasses.uploadText}>
                    {file ? (
                      <span className={`${isDark ? 'text-[#9C27B0]' : 'text-[#805AD5]'} animate-fade-in-left`}>
                        {file.name}
                      </span>
                    ) : (
                      'Drag & drop your resume here'
                    )}
                  </h3>

                  <p className={themeClasses.uploadSubtext}>
                    {file ? (
                      <span className="animate-fade-in-right">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
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
                      className={`text-sm ${isDark ? 'text-red-400 hover:text-[#00FFFF]' : 'text-red-500 hover:text-[#3182CE]'} transition-colors duration-300 animate-fade-in-up`}
                    >
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <label htmlFor="job-description" className={themeClasses.label}>
              <span className={themeClasses.labelGradient}>
                Job Description (Optional)
              </span>
            </label>
            <div className="relative">
              <textarea
                id="job-description"
                rows="6"
                placeholder="Paste job description to get more accurate analysis..."
                className={themeClasses.textarea}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={2000}
              />
              <div className={themeClasses.charCount}>
                {jobDescription.length}/2000
              </div>
            </div>
            <p className={themeClasses.hint} style={{ animationDelay: '400ms' }}>
              💡 Adding a job description helps us match your resume to specific requirements
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={themeClasses.errorContainer}>
              <div className="flex items-center space-x-2">
                <div className={themeClasses.errorIcon}>
                  <span className={`${isDark ? 'text-red-400' : 'text-red-600'} text-xs`}>!</span>
                </div>
                <span className={themeClasses.errorText}>{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <Button
              text={isLoading ? 'Processing...' : 'Analyze Resume'}
              onClick={handleSubmit}
              disabled={isLoading || !file}
              className={`w-full py-4 text-lg font-semibold transition-all duration-400 ${
                isLoading || !file
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 hover:shadow-2xl transform'
              }`}
            />
            
            {isLoading && (
              <div className="flex items-center justify-center mt-4 space-x-2 animate-fade-in-up">
                <div className={`w-2 h-2 ${isDark ? 'bg-[#00FFFF]' : 'bg-[#3182CE]'} rounded-full animate-bounce`}></div>
                <div className={`w-2 h-2 ${isDark ? 'bg-[#9C27B0]' : 'bg-[#805AD5]'} rounded-full animate-bounce`} style={{ animationDelay: '100ms' }}></div>
                <div className={`w-2 h-2 ${isDark ? 'bg-[#00FFFF]' : 'bg-[#3182CE]'} rounded-full animate-bounce`} style={{ animationDelay: '200ms' }}></div>
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UploadForm;