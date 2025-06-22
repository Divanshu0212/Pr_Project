import { useState, useEffect } from 'react';
import axios from 'axios';

const ResumeATSScanner = () => {
  const [profession, setProfession] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [keywords, setKeywords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const professions = [
    'Software Engineer',
    'Data Scientist',
    'Marketing Manager',
    'Project Manager',
    'Financial Analyst',
    'Graphic Designer',
    'Sales Representative',
    'Human Resources Manager',
    'Customer Service Representative',
    'Product Manager',
    'Business Analyst',
    'Accountant',
  ];

  const fetchKeywords = async () => {
    if (!profession) {
      setError('Please select a profession first');
      return;
    }
  
    setKeywordsLoading(true);
    setError('');
  
    try {
      const response = await axios.post('http://localhost:8000/api/profession-keywords', {
        profession,
        experience_level: experienceLevel
      });
      
      const newKeywords = response.data.keywords;
      setKeywords(newKeywords);
      console.log("Fetched keywords:", newKeywords);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch keywords');
    } finally {
      setKeywordsLoading(false);
    }
  };

  useEffect(() => {
    if (profession) {
      fetchKeywords();
    }
  }, [profession, experienceLevel]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a resume file');
      return;
    }
  
    if (!keywords) {
      setError('Please wait for keywords to load or select a profession');
      return;
    }
  
    setLoading(true);
    setError('');
    setResults(null);
  
    const formData = new FormData();
    formData.append('file', file);
    
    let keywordsToSend = keywords;
    if (Array.isArray(keywords)) {
      keywordsToSend = {
        "technical_skills": keywords[0]?.technical_skills || [],
        "soft_skills": keywords[0]?.soft_skills || [],
        "certifications": keywords[0]?.certifications || [],
        "experience_terms": keywords[0]?.experience_terms || [],
        "education_requirements": keywords[0]?.education_requirements || []
      };
    }
    
    console.log("Sending keywords to backend:", keywordsToSend);
    formData.append('keywords', JSON.stringify(keywordsToSend));

    try {
      const response = await axios.post('http://localhost:8000/api/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing resume');
    } finally {
      setLoading(false);
    }
  };

  const renderScoreGauge = (score, label) => {
    let gradientClass = 'from-accent-error to-red-400';
    if (score >= 70) gradientClass = 'from-accent-primary to-accent-secondary';
    else if (score >= 50) gradientClass = 'from-yellow-400 to-orange-500';

    return (
      <div className="mb-6 animate-fade-in-up">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">{label}</span>
          <span className="text-sm font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            {score.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-background-secondary rounded-full h-3 shadow-inner">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-800 ease-out shadow-glow`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const LoadingState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in-up">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-background-secondary"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-accent-primary border-r-accent-secondary absolute top-0 left-0"></div>
      </div>
      <p className="text-text-primary text-lg mt-4 animate-pulse-slow">{message}</p>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 border border-accent-error/50 text-accent-error px-6 py-4 rounded-lg mb-6 animate-fade-in-down backdrop-blur-sm">
      <p className="font-medium">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary text-text-primary">
      <div className="bg-gradient-mesh min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-12 text-center animate-fade-in-down">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent mb-4 animate-gradient-x">
              Resume ATS Analyzer
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Get AI-powered insights to optimize your resume for Applicant Tracking Systems
            </p>
          </div>
          
          {error && <ErrorMessage message={error} />}
          
          {!showResults ? (
            <div className="bg-gradient-card-dark backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-lifted border border-accent-neutral/20 animate-fade-in-up">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="animate-fade-in-left">
                    <label htmlFor="profession" className="block mb-3 text-lg font-semibold text-text-primary">
                      Select Your Profession
                    </label>
                    <select
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="block w-full p-4 bg-background-primary/50 border border-accent-neutral/30 rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 backdrop-blur-sm"
                      required
                    >
                      <option value="" disabled>Choose a profession</option>
                      {professions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="other">Other (specify)</option>
                    </select>
                    
                    {profession === 'other' && (
                      <input
                        type="text"
                        placeholder="Enter your profession"
                        className="mt-4 block w-full p-4 bg-background-primary/50 border border-accent-neutral/30 rounded-xl text-text-primary animate-slide-up"
                        onChange={(e) => setProfession(e.target.value)}
                      />
                    )}
                  </div>
                  
                  <div className="animate-fade-in-right">
                    <label htmlFor="experienceLevel" className="block mb-3 text-lg font-semibold text-text-primary">
                      Experience Level
                    </label>
                    <select
                      id="experienceLevel"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="block w-full p-4 bg-background-primary/50 border border-accent-neutral/30 rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-300 backdrop-blur-sm"
                    >
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior Level (6+ years)</option>
                    </select>
                  </div>
                </div>
                
                <div className="animate-fade-in-up-delay-200">
                  <label className="block mb-4 text-lg font-semibold text-text-primary">Upload Your Resume</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-accent-primary/50 rounded-2xl cursor-pointer bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 hover:from-accent-primary/10 hover:to-accent-secondary/10 transition-all duration-300 group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-4 text-accent-primary group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-lg font-medium text-text-primary">
                          <span className="font-bold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-text-secondary">PDF, DOCX, or TXT (Max 10MB)</p>
                        {fileName && (
                          <p className="text-lg font-semibold text-accent-primary mt-3 animate-bounce-gentle">{fileName}</p>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-center animate-fade-in-up-delay-400">
                  <button
                    type="submit"
                    className="px-12 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold text-lg rounded-xl hover:shadow-glow-purple focus:outline-none focus:ring-4 focus:ring-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                    disabled={loading || keywordsLoading || !file || !profession}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                </div>
                
                {keywordsLoading && (
                  <div className="p-6 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 rounded-xl animate-fade-in-up backdrop-blur-sm">
                    <LoadingState message={`Loading ATS keywords for ${profession} (${experienceLevel} level)...`} />
                  </div>
                )}
              </form>
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
                      strokeDasharray={`${results.total_score * 2.51}, 251`}
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
                    <span className="text-5xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                      {results.total_score}
                    </span>
                    <span className="text-2xl text-text-secondary">/100</span>
                  </div>
                </div>
                <p className="text-xl font-medium text-text-primary mt-6 max-w-md mx-auto">
                  {results.total_score >= 70
                    ? "🎉 Excellent! Your resume is ATS-optimized"
                    : results.total_score >= 50
                    ? "⚡ Good start! Some improvements needed"
                    : "🔧 Needs work to pass ATS screening"}
                </p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-text-primary">Score Breakdown</h3>
                {renderScoreGauge(results.keyword_score * 2.5, "🎯 Keyword Optimization (40%)")}
                {renderScoreGauge(results.format_score * (10/3), "📄 Format & Structure (30%)")}
                {renderScoreGauge(results.achievements_score * (10/3), "🏆 Achievements & Impact (30%)")}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 p-6 rounded-xl border border-green-500/30 animate-fade-in-left backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center">
                    ✅ Keywords Found ({results.detailed_analysis.keywords_found.length})
                  </h3>
                  {results.detailed_analysis.keywords_found.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.detailed_analysis.keywords_found.map((kw, idx) => (
                        <span key={`found-${idx}`} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary">No matching keywords found.</p>
                  )}
                </div>
                
                <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 p-6 rounded-xl border border-red-500/30 animate-fade-in-right backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center">
                    ❌ Missing Keywords ({results.detailed_analysis.missing_keywords.length})
                  </h3>
                  {results.detailed_analysis.missing_keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.detailed_analysis.missing_keywords.slice(0, 10).map((kw, idx) => (
                        <span key={`missing-${idx}`} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
                          {kw}
                        </span>
                      ))}
                      {results.detailed_analysis.missing_keywords.length > 10 && (
                        <span className="px-3 py-1 bg-accent-neutral/20 text-text-secondary rounded-full text-sm italic">
                          +{results.detailed_analysis.missing_keywords.length - 10} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-green-400">🎉 All keywords included!</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 p-6 rounded-xl mb-8 border border-accent-primary/30 animate-fade-in-up backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 text-accent-primary">💡 Improvement Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.keyword_score < 30 && (
                    <div className="flex items-start space-x-3">
                      <span className="text-accent-secondary">🎯</span>
                      <p className="text-text-primary">Add more industry-specific keywords from the missing list.</p>
                    </div>
                  )}
                  {results.format_score < 20 && (
                    <div className="flex items-start space-x-3">
                      <span className="text-accent-secondary">📄</span>
                      <p className="text-text-primary">Improve structure with clear section headings.</p>
                    </div>
                  )}
                  {results.achievements_score < 20 && (
                    <div className="flex items-start space-x-3">
                      <span className="text-accent-secondary">📊</span>
                      <p className="text-text-primary">Include quantifiable achievements with numbers.</p>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <span className="text-accent-secondary">🎨</span>
                    <p className="text-text-primary">Use simple formatting without complex designs.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-8 py-3 bg-gradient-to-r from-accent-neutral/20 to-accent-neutral/30 text-text-primary rounded-xl hover:from-accent-neutral/30 hover:to-accent-neutral/40 transition-all duration-300 border border-accent-neutral/30 backdrop-blur-sm"
                >
                  ← Back to Scanner
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-card-light backdrop-blur-lg rounded-2xl p-8 shadow-card border border-accent-neutral/20 animate-fade-in-up-delay-300">
            <h2 className="text-2xl font-bold text-accent-primary mb-6">🚀 How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "👤", title: "Select Profession", desc: "Choose your field and experience level" },
                { icon: "📤", title: "Upload Resume", desc: "Upload your PDF resume file" },
                { icon: "🔍", title: "AI Analysis", desc: "Our AI scans for keywords and formatting" },
                { icon: "📊", title: "Get Results", desc: "Receive detailed score and tips" }
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