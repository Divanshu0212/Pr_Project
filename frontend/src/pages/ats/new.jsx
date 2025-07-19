import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/AuthContext'; // Assuming this is where your theme context is
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const ResumeATSScanner = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [dragover, setDragover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const API_BASE_URL = 'http://localhost:8001';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragover(true);
  };

  const handleDragLeave = () => {
    setDragover(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a PDF or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const analyzeResume = async () => {
    if (activeTab === 'upload' && !selectedFile) {
      setError('Please select a resume file to analyze.');
      return;
    }

    if (activeTab === 'text' && !resumeText.trim()) {
      setError('Please paste your resume text to analyze.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (activeTab === 'upload') {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        if (jobDescription) {
          formData.append('job_description', jobDescription);
        }

        response = await fetch(`${API_BASE_URL}/analyze`, {
          method: 'POST',
          body: formData
        });
      } else {
        const requestBody = {
          resume_text: resumeText,
          job_description: jobDescription
        };

        response = await fetch(`${API_BASE_URL}/analyze-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setResults(result);
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the analysis server. Please make sure the backend is running on port 8001.');
      } else {
        setError(`Analysis failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderScoreGauge = (score, label) => (
    <div className="mb-6 opacity-0 animate-slide-in-left" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
      <div className="flex justify-between items-center mb-3">
        <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {label}
        </span>
        <span className={`font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent`}>
          {Math.round(score)}%
        </span>
      </div>
      <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/70'} backdrop-blur-sm`}>
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out animate-pulse-glow" 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-600/10 animate-gradient-shift"></div>
      
      <div className={`relative z-10 max-w-6xl mx-auto px-6 py-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        {/* Hero Section */}
        <div className="mb-16 text-center animate-slide-in-down">
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x leading-tight">
            ATS Resume
            <br />
            <span className="animate-pulse">Analyzer</span>
          </h1>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
            Optimize your resume for Applicant Tracking Systems with 
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-semibold"> AI-powered analysis</span>
          </p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 animate-shake">
            <Card className={`border-l-4 border-red-500 ${isDark ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700'} backdrop-blur-sm`}>
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </Card>
          </div>
        )}
        
        {!results ? (
          <Card className={`mb-12 backdrop-blur-lg border ${isDark ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white/70 border-gray-200/50'} animate-slide-in-up shadow-2xl`}>
            <div className="p-8">
              {/* Tab Navigation */}
              <div className={`flex space-x-2 mb-8 p-1 rounded-2xl ${isDark ? 'bg-gray-700/30' : 'bg-gray-100/50'} backdrop-blur-sm`}>
                <button
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'upload' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                      : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-600/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}`
                  }`}
                  onClick={() => setActiveTab('upload')}
                >
                  <span className="text-xl mr-2">📄</span>
                  Upload File
                </button>
                <button
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'text' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                      : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-600/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'}`
                  }`}
                  onClick={() => setActiveTab('text')}
                >
                  <span className="text-xl mr-2">📝</span>
                  Paste Text
                </button>
              </div>

              {/* Upload Tab Content */}
              {activeTab === 'upload' ? (
                <div className="space-y-8">
                  <div 
                    className={`flex flex-col items-center justify-center p-16 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                      dragover 
                        ? 'border-cyan-400 bg-cyan-400/20 scale-105' 
                        : `border-cyan-400/50 hover:border-cyan-400 ${isDark ? 'bg-cyan-400/5 hover:bg-cyan-400/10' : 'bg-cyan-50/50 hover:bg-cyan-100/50'}`
                    }`}
                    onClick={() => document.getElementById('file-input').click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="text-6xl mb-6 text-cyan-400 animate-bounce">📁</div>
                    <div className="text-center space-y-2">
                      <p className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Click to upload or drag & drop
                      </p>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>
                        your resume file here
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
                        Supports PDF and DOCX files (Max 10MB)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      id="file-input" 
                      className="hidden" 
                      accept=".pdf,.docx" 
                      onChange={handleFileSelect}
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className={`border rounded-2xl p-6 ${isDark ? 'bg-purple-900/20 border-purple-500/30' : 'bg-purple-50/50 border-purple-200/50'} animate-slide-in-right`}>
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">✅</span>
                        <div>
                          <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Selected: <span className="text-cyan-400">{selectedFile.name}</span>
                          </p>
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-slide-in-left">
                  <textarea
                    className={`w-full p-6 rounded-2xl border-2 focus:ring-4 transition-all duration-300 min-h-[250px] text-lg ${
                      isDark 
                        ? 'bg-gray-700/30 border-gray-600/50 text-white focus:ring-cyan-400/30 focus:border-cyan-400 placeholder-gray-400' 
                        : 'bg-white/60 border-gray-300/50 text-gray-800 focus:ring-cyan-400/20 focus:border-cyan-400 placeholder-gray-500'
                    } backdrop-blur-sm`}
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              )}

              {/* Job Description */}
              <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label className={`block mb-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <span className="text-2xl mr-2">🎯</span>
                  Job Description (Optional)
                </label>
                <textarea
                  className={`w-full p-6 rounded-2xl border-2 focus:ring-4 transition-all duration-300 min-h-[150px] text-lg ${
                    isDark 
                      ? 'bg-gray-700/30 border-gray-600/50 text-white focus:ring-purple-400/30 focus:border-purple-400 placeholder-gray-400' 
                      : 'bg-white/60 border-gray-300/50 text-gray-800 focus:ring-purple-400/20 focus:border-purple-400 placeholder-gray-500'
                  } backdrop-blur-sm`}
                  placeholder="Paste the job description here for better keyword matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Analyze Button */}
              <div className="mt-10 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <Button
                  className="w-full py-6 text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                  onClick={analyzeResume}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full mr-4"></div>
                      <span className="animate-pulse">Analyzing Resume...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="text-2xl mr-3">🔍</span>
                      Analyze Resume
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Results Section */
          <Card className={`mb-12 backdrop-blur-lg border ${isDark ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white/70 border-gray-200/50'} animate-slide-in-up shadow-2xl`}>
            <div className="p-8">
              <h2 className="text-5xl font-black mb-12 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                🎯 Analysis Results
              </h2>
              
              {/* Overall Score Circle */}
              <div className="mb-16 text-center animate-zoom-in">
                <div className="relative inline-block">
                  <svg className="w-64 h-64 transform -rotate-90 animate-spin-slow" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
                      strokeWidth="6"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#scoreGradient)" 
                      strokeWidth="6"
                      strokeDasharray={`${results.overall_score * 2.51}, 251`}
                      strokeLinecap="round"
                      className="animate-draw-circle"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00FFFF" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#9C27B0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-pulse">
                    <span className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      {results.overall_score}
                    </span>
                    <span className={`text-3xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>/100</span>
                  </div>
                </div>
                <p className={`text-2xl font-bold mt-8 max-w-md mx-auto ${isDark ? 'text-white' : 'text-gray-800'} animate-fade-in-up`} style={{ animationDelay: '0.5s' }}>
                  {results.overall_score >= 70
                    ? "🎉 Excellent! Your resume is ATS-optimized"
                    : results.overall_score >= 50
                    ? "⚡ Good start! Some improvements needed"
                    : "🔧 Needs work to pass ATS screening"}
                </p>
              </div>
              
              {/* Score Breakdown */}
              <div className="mb-12">
                <h3 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'} animate-slide-in-left`}>
                  📊 Score Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(results.detailed_scores).map(([category, score], index) => (
                    <div key={category} className="animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                      {renderScoreGauge(score, `${category.charAt(0).toUpperCase() + category.slice(1)}`)}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Detailed Feedback */}
              <div className={`p-8 rounded-2xl mb-12 border ${isDark ? 'bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-400/30' : 'bg-gradient-to-br from-cyan-50/50 to-purple-50/50 border-cyan-200/50'} backdrop-blur-sm animate-fade-in-up`} style={{ animationDelay: '0.3s' }}>
                <h3 className="text-2xl font-bold mb-6 text-cyan-400 flex items-center">
                  <span className="text-3xl mr-3">💡</span>
                  Detailed Feedback
                </h3>
                <div className="space-y-8">
                  {Object.entries(results.feedback).map(([category, feedbackList], index) => (
                    <div key={category} className={`p-6 rounded-xl border ${isDark ? 'bg-gray-700/30 border-gray-600/20' : 'bg-white/40 border-gray-200/30'} backdrop-blur-sm animate-slide-in-up`} style={{ animationDelay: `${index * 0.1 + 0.4}s` }}>
                      <h4 className={`font-bold text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h4>
                      <ul className="space-y-3">
                        {feedbackList.map((item, idx) => (
                          <li key={idx} className="flex items-start animate-fade-in" style={{ animationDelay: `${(index * 0.1 + idx * 0.05 + 0.5)}s` }}>
                            <span className="text-cyan-400 mr-3 text-lg font-bold">•</span>
                            <span className={`${isDark ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 p-6 rounded-2xl ${isDark ? 'bg-gray-700/30 border-gray-600/20' : 'bg-white/40 border-gray-200/30'} border backdrop-blur-sm animate-slide-in-up`} style={{ animationDelay: '0.6s' }}>
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <p className={`text-sm uppercase tracking-wider font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Word Count</p>
                  <p className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{results.word_count || 'N/A'}</p>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <p className={`text-sm uppercase tracking-wider font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Method</p>
                  <p className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{results.analysis_method || 'N/A'}</p>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
                  <p className={`text-sm uppercase tracking-wider font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Analyzed</p>
                  <p className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(results.analysis_timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Back Button */}
              <div className="text-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <Button
                  onClick={() => setResults(null)}
                  className={`px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/30' 
                      : 'bg-white/60 hover:bg-white/80 text-gray-800 border border-gray-300/50'
                  } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                >
                  ← Back to Analyzer
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* How It Works Section */}
        <Card className={`backdrop-blur-lg border ${isDark ? 'bg-gray-800/50 border-gray-700/30' : 'bg-white/70 border-gray-200/50'} animate-slide-in-up shadow-2xl`} style={{ animationDelay: '0.4s' }}>
          <div className="p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center animate-fade-in">
              <span className="text-4xl mr-4">🚀</span>
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: "📄", title: "Upload Resume", desc: "Upload your PDF or DOCX resume file securely", color: "from-cyan-400 to-blue-500" },
                { icon: "🔍", title: "AI Analysis", desc: "Our AI scans for ATS optimization patterns", color: "from-blue-500 to-purple-500" },
                { icon: "📊", title: "Get Results", desc: "Receive detailed score and actionable feedback", color: "from-purple-500 to-pink-500" },
                { icon: "✨", title: "Improve", desc: "Optimize your resume based on insights", color: "from-pink-500 to-cyan-400" }
              ].map((step, idx) => (
                <div key={idx} className={`text-center p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 animate-slide-in-up ${
                  isDark ? 'bg-gray-700/30 border-gray-600/20 hover:bg-gray-600/30' : 'bg-white/40 border-gray-200/30 hover:bg-white/60'
                }`} style={{ animationDelay: `${idx * 0.1 + 0.5}s` }}>
                  <div className="text-5xl mb-4 animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>{step.icon}</div>
                  <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{step.desc}</p>
                  <div className={`mt-4 h-1 bg-gradient-to-r ${step.color} rounded-full animate-pulse`}></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResumeATSScanner;