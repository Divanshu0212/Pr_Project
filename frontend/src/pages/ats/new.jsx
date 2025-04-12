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

  // List of common professions for the dropdown
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
      
      // Log the keywords after state has been updated
      console.log("Fetched keywords:", newKeywords);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch keywords');
    } finally {
      setKeywordsLoading(false);
    }
  };

  // Fetch keywords when profession or experience level changes
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
    
    // Check if keywords is an array instead of an object
    let keywordsToSend = keywords;
    if (Array.isArray(keywords)) {
      // Convert the array to the expected object format
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
    // Determine color based on score
    let color = 'bg-red-500';
    if (score >= 70) color = 'bg-green-500';
    else if (score >= 50) color = 'bg-yellow-500';

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-[#E5E5E5]">{label}</span>
          <span className="text-sm font-medium text-[#E5E5E5]">{score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#30363D] rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
      </div>
    );
  };

  // Loading component that matches your theme
  const LoadingState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFFF] mb-4"></div>
      <p className="text-[#E5E5E5] text-lg">{message}</p>
    </div>
  );

  // Error message component that matches your theme
  const ErrorMessage = ({ message }) => (
    <div className="bg-[#3C1618] border border-[#F87171] text-[#F87171] px-4 py-3 rounded-md mb-4">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="w-full bg-[#0D1117] text-[#E5E5E5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E5E5E5] mb-2">Resume ATS Score Analyzer</h1>
          <p className="text-gray-400">
            Upload your resume and select your profession to get a detailed ATS compatibility analysis.
          </p>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        {/* Main Content */}
        {!showResults ? (
          <div className="bg-[#161B22] rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profession Selection */}
                <div>
                  <label htmlFor="profession" className="block mb-2 text-sm font-medium text-[#E5E5E5]">
                    Select Your Profession
                  </label>
                  <select
                    id="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="block w-full p-2.5 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E5E5E5] focus:ring-[#00FFFF] focus:border-[#00FFFF]"
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
                      className="mt-3 block w-full p-2.5 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E5E5E5]"
                      onChange={(e) => setProfession(e.target.value)}
                    />
                  )}
                </div>
                
                {/* Experience Level */}
                <div>
                  <label htmlFor="experienceLevel" className="block mb-2 text-sm font-medium text-[#E5E5E5]">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="block w-full p-2.5 bg-[#0D1117] border border-[#30363D] rounded-md text-[#E5E5E5] focus:ring-[#00FFFF] focus:border-[#00FFFF]"
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6+ years)</option>
                  </select>
                </div>
              </div>
              
              {/* Resume Upload */}
              <div className="mt-6">
                <label className="block mb-2 text-sm font-medium text-[#E5E5E5]">Upload Your Resume</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#30363D] border-dashed rounded-lg cursor-pointer bg-[#0D1117] hover:bg-[#161B22]">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOCX, or TXT (Max 10MB)</p>
                      {fileName && (
                        <p className="text-sm text-[#00FFFF] mt-2">{fileName}</p>
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
              
              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#00FFFF] text-black font-medium rounded-md hover:bg-[#00CCCC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FFFF] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  disabled={loading || keywordsLoading || !file || !profession}
                >
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
              </div>
              
              {/* Loading Keywords Indicator */}
              {keywordsLoading && (
                <div className="p-4 text-[#00FFFF] bg-[#0D1117] border border-[#30363D] rounded-md mt-4">
                  <LoadingState message={`Loading ATS keywords for ${profession} (${experienceLevel} level)...`} />
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-[#161B22] rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#00FFFF]">ATS Scan Results</h2>
            
            {/* Overall Score */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#30363D" 
                      strokeWidth="10"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={results.total_score >= 70 ? "#10B981" : results.total_score >= 50 ? "#F59E0B" : "#EF4444"} 
                      strokeWidth="10"
                      strokeDasharray={`${results.total_score * 2.83}, 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold text-[#E5E5E5]">{results.total_score}</span>
                    <span className="text-lg text-gray-400">/100</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-lg font-medium text-[#E5E5E5]">
                {results.total_score >= 70
                  ? "Great job! Your resume is well-optimized for ATS."
                  : results.total_score >= 50
                  ? "Your resume needs some improvements to pass ATS screening."
                  : "Your resume needs significant improvements to pass ATS screening."}
              </p>
            </div>
            
            {/* Score Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-[#E5E5E5]">Score Breakdown</h3>
              {renderScoreGauge(results.keyword_score * 2.5, "Keyword Optimization (40%)")}
              {renderScoreGauge(results.format_score * (10/3), "Resume Format & Structure (30%)")}
              {renderScoreGauge(results.achievements_score * (10/3), "Achievements & Impact (30%)")}
            </div>
            
            {/* Keyword Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0D1117] p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2 text-green-400">Keywords Found ({results.detailed_analysis.keywords_found.length})</h3>
                {results.detailed_analysis.keywords_found.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {results.detailed_analysis.keywords_found.map((kw, idx) => (
                      <li key={`found-${idx}`} className="text-sm text-[#E5E5E5]">{kw}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No matching keywords found.</p>
                )}
              </div>
              <div className="bg-[#0D1117] p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2 text-red-400">Missing Keywords ({results.detailed_analysis.missing_keywords.length})</h3>
                {results.detailed_analysis.missing_keywords.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {results.detailed_analysis.missing_keywords.slice(0, 10).map((kw, idx) => (
                      <li key={`missing-${idx}`} className="text-sm text-[#E5E5E5]">{kw}</li>
                    ))}
                    {results.detailed_analysis.missing_keywords.length > 10 && (
                      <li className="text-sm italic text-gray-400">
                        ...and {results.detailed_analysis.missing_keywords.length - 10} more
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">Great job! You've included all recommended keywords.</p>
                )}
              </div>
            </div>
            
            {/* Improvement Tips */}
            <div className="bg-[#0D1117] p-4 rounded-md mb-6">
              <h3 className="text-lg font-semibold mb-2 text-[#00FFFF]">Tips for Improvement</h3>
              <ul className="list-disc pl-5 space-y-2 text-[#E5E5E5]">
                {results.keyword_score < 30 && (
                  <li>Add more industry-specific keywords from the missing keywords list.</li>
                )}
                {results.format_score < 20 && (
                  <li>Improve your resume's structure with clear section headings (Experience, Education, Skills, etc.).</li>
                )}
                {results.achievements_score < 20 && (
                  <li>Include more quantifiable achievements with numbers and percentages.</li>
                )}
                <li>Tailor your resume specifically for each job application.</li>
                <li>Use simple formatting without tables, headers/footers, or complex designs.</li>
                <li>Submit your resume in PDF format to preserve formatting.</li>
              </ul>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-[#30363D] text-[#E5E5E5] rounded-md hover:bg-[#3C444D] transition-colors"
              >
                Back to Scanner
              </button>
            </div>
          </div>
        )}
        
        {/* How It Works */}
        <div className="bg-[#161B22] rounded-lg p-6">
          <h2 className="text-xl text-[#00FFFF] mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-[#E5E5E5] space-y-2">
            <li>Select your profession and experience level</li>
            <li>Upload your resume (PDF format recommended)</li>
            <li>Our ATS analyzer will check for keyword matches, formatting, and achievements</li>
            <li>Get a detailed score and recommendations to improve your resume</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ResumeATSScanner;