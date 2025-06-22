import React, { useState } from 'react';

const ResumeATSScanner = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [dragover, setDragover] = useState(false);

  const API_BASE_URL = 'http://localhost:8001';

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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-text-primary font-medium">{label}</span>
        <span className="text-text-primary font-bold">{Math.round(score)}%</span>
      </div>
      <div className="w-full bg-background-primary/50 h-3 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full" 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary text-text-primary">
      <div className="bg-gradient-mesh min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-12 text-center animate-fade-in-down">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent mb-4 animate-gradient-x">
              ATS Resume Analyzer
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Optimize your resume for Applicant Tracking Systems with AI-powered analysis
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}
          
          {!results ? (
            <div className="bg-gradient-card-dark backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-lifted border border-accent-neutral/20 animate-fade-in-up">
              <div className="flex space-x-2 mb-6 bg-background-primary/20 rounded-xl p-1">
                <button
                  className={`flex-1 py-3 rounded-lg transition-all ${activeTab === 'upload' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                  onClick={() => setActiveTab('upload')}
                >
                  📄 Upload File
                </button>
                <button
                  className={`flex-1 py-3 rounded-lg transition-all ${activeTab === 'text' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                  onClick={() => setActiveTab('text')}
                >
                  📝 Paste Text
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="space-y-6">
                  <div 
                    className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragover ? 'border-accent-primary bg-accent-primary/10' : 'border-accent-primary/50 hover:border-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10'}`}
                    onClick={() => document.getElementById('file-input').click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="text-4xl mb-4 text-accent-primary">📁</div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-text-primary mb-1">Click to upload</p>
                      <p className="text-text-secondary">or drag and drop your resume</p>
                      <p className="text-sm text-text-secondary mt-2">Supports PDF and DOCX files</p>
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
                    <div className="bg-accent-secondary/10 border border-accent-secondary/30 p-4 rounded-xl">
                      <p className="font-medium text-text-primary">
                        Selected file: <span className="text-accent-primary">{selectedFile.name}</span>
                      </p>
                      <p className="text-sm text-text-secondary">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="w-full p-4 bg-background-primary/50 border border-accent-neutral/30 rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 backdrop-blur-sm min-h-[200px]"
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              )}

              <div className="mt-6">
                <label className="block mb-3 text-lg font-semibold text-text-primary">
                  Job Description (Optional)
                </label>
                <textarea
                  className="w-full p-4 bg-background-primary/50 border border-accent-neutral/30 rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 backdrop-blur-sm min-h-[120px]"
                  placeholder="Paste the job description here for better keyword matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <button
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold rounded-xl hover:shadow-glow-purple focus:outline-none focus:ring-4 focus:ring-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
                onClick={analyzeResume}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                    Analyzing...
                  </span>
                ) : (
                  '🔍 Analyze Resume'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gradient-card-dark backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-lifted border border-accent-neutral/20 animate-fade-in-up">
              <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                ATS Analysis Results
              </h2>
              
              <div className="mb-12 text-center animate-scale-in">
                <div className="relative inline-block">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.1)" 
                      strokeWidth="8"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="8"
                      strokeDasharray={`${results.overall_score * 2.51}, 251`}
                      strokeLinecap="round"
                      className="animate-gradient-x"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3182CE" />
                        <stop offset="100%" stopColor="#805AD5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text">
                      {results.overall_score}
                    </span>
                    <span className="text-2xl text-text-secondary">/100</span>
                  </div>
                </div>
                <p className="text-xl font-medium text-text-primary mt-6 max-w-md mx-auto">
                  {results.overall_score >= 70
                    ? "🎉 Excellent! Your resume is ATS-optimized"
                    : results.overall_score >= 50
                    ? "⚡ Good start! Some improvements needed"
                    : "🔧 Needs work to pass ATS screening"}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-text-primary">Score Breakdown</h3>
                {Object.entries(results.detailed_scores).map(([category, score]) => (
                  renderScoreGauge(score, `📌 ${category}`)
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl mb-8 border border-accent-primary/30 animate-fade-in-up backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 text-accent-primary">💡 Detailed Feedback</h3>
                <div className="space-y-6">
                  {Object.entries(results.feedback).map(([category, feedbackList]) => (
                    <div key={category} className="bg-background-primary/20 p-4 rounded-lg border border-accent-neutral/20">
                      <h4 className="font-bold text-lg text-text-primary mb-3">{category}</h4>
                      <ul className="space-y-2">
                        {feedbackList.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span className="text-text-primary">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-background-primary/20 p-4 rounded-xl border border-accent-neutral/20">
                <div className="text-center">
                  <p className="text-sm text-text-secondary uppercase tracking-wider">Word Count</p>
                  <p className="text-xl font-bold text-text-primary">{results.word_count || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-secondary uppercase tracking-wider">Analysis Method</p>
                  <p className="text-xl font-bold text-text-primary">{results.analysis_method || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-secondary uppercase tracking-wider">Analyzed</p>
                  <p className="text-xl font-bold text-text-primary">
                    {new Date(results.analysis_timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setResults(null)}
                  className="px-8 py-3 bg-gradient-to-r from-accent-neutral/20 to-accent-neutral/30 text-text-primary rounded-xl hover:from-accent-neutral/30 hover:to-accent-neutral/40 transition-all duration-300 border border-accent-neutral/30 backdrop-blur-sm"
                >
                  ← Back to Analyzer
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-card-light backdrop-blur-lg rounded-2xl p-8 shadow-card border border-accent-neutral/20 animate-fade-in-up-delay-300">
            <h2 className="text-2xl font-bold text-accent-primary mb-6">🚀 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "📄", title: "Upload Resume", desc: "Upload your PDF or DOCX resume file" },
                { icon: "🔍", title: "AI Analysis", desc: "Our AI scans for ATS optimization" },
                { icon: "📊", title: "Get Results", desc: "Receive detailed score and feedback" },
                { icon: "✨", title: "Improve", desc: "Optimize your resume based on insights" }
              ].map((step, idx) => (
                <div key={idx} className={`text-center p-4 rounded-xl bg-gradient-to-br from-background-primary/50 to-background-secondary/50 border border-accent-neutral/20 animate-fade-in-up-delay-${(idx + 1) * 100}`}>
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="font-bold text-text-primary mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeATSScanner;