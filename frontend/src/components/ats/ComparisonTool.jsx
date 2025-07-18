import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

const ComparisonTool = ({ resumes }) => {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleResumeSelect = (resumeId) => {
    if (selectedResumes.includes(resumeId)) {
      setSelectedResumes(selectedResumes.filter(id => id !== resumeId));
    } else if (selectedResumes.length < 2) {
      setSelectedResumes([...selectedResumes, resumeId]);
    }
  };

  const compareResumes = () => {
    if (selectedResumes.length !== 2) return;

    const resume1 = resumes.find(r => r.id === selectedResumes[0]);
    const resume2 = resumes.find(r => r.id === selectedResumes[1]);

    setComparisonResults({
      scoreComparison: {
        resume1: resume1.score,
        resume2: resume2.score,
        difference: Math.abs(resume1.score - resume2.score)
      },
      keywordComparison: {
        resume1: resume1.matchedKeywords,
        resume2: resume2.matchedKeywords,
        uniqueToResume1: resume1.matchedKeywords.filter(k => !resume2.matchedKeywords.includes(k)),
        uniqueToResume2: resume2.matchedKeywords.filter(k => !resume1.matchedKeywords.includes(k))
      }
    });
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-emerald-400 to-green-500';
    if (score >= 60) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <div className={`transition-all duration-1000 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <Card className="relative overflow-hidden group">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${
          isDark 
            ? 'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10' 
            : 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10'
        } opacity-40 group-hover:opacity-60`}></div>
        
        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 animate-pulse-slow"></div>
        
        <div className="relative z-10">
          {/* Header with gradient text */}
          <div className="mb-8 text-center">
            <h3 className={`text-3xl font-bold bg-gradient-to-r ${
              isDark 
                ? 'from-cyan-400 via-purple-400 to-pink-400' 
                : 'from-blue-600 via-purple-600 to-indigo-600'
            } bg-clip-text text-transparent mb-2 animate-fade-in-up`}>
              Resume Comparison Tool
            </h3>
            <div className={`h-1 w-24 mx-auto rounded-full bg-gradient-to-r ${
              isDark 
                ? 'from-cyan-400 to-purple-400' 
                : 'from-blue-500 to-purple-500'
            } animate-scale-in`}></div>
          </div>

          {/* Resume selection */}
          <div className="mb-8">
            <p className={`${
              isDark ? 'text-gray-300' : 'text-gray-600'
            } mb-6 text-lg font-medium text-center`}>
              Select two resumes to compare:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resumes.map((resume, index) => (
                <div
                  key={resume.id}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 ${
                    selectedResumes.includes(resume.id)
                      ? `${
                          isDark 
                            ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-400/25' 
                            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/25'
                        }`
                      : `${
                          isDark 
                            ? 'bg-background-secondary hover:bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600' 
                            : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                        }`
                  } shadow-lg hover:shadow-xl`}
                  onClick={() => handleResumeSelect(resume.id)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${
                        isDark ? 'text-gray-100' : 'text-gray-800'
                      } font-bold text-lg mb-2`}>
                        {resume.name}
                      </p>
                      <p className={`${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      } text-sm`}>
                        Score: <span className={`font-bold text-xl ${
                          isDark ? 'text-cyan-400' : 'text-blue-600'
                        }`}>
                          {resume.score}%
                        </span>
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedResumes.includes(resume.id)
                        ? `${
                            isDark 
                              ? 'border-cyan-400 bg-cyan-400' 
                              : 'border-blue-500 bg-blue-500'
                          }`
                        : `${
                            isDark 
                              ? 'border-gray-500' 
                              : 'border-gray-300'
                          }`
                    }`}>
                      {selectedResumes.includes(resume.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compare button */}
          <div className="flex justify-center mb-8">
            <Button
              text="Compare Resumes"
              onClick={compareResumes}
              disabled={selectedResumes.length !== 2}
              className={`px-8 py-4 text-lg font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                selectedResumes.length === 2
                  ? `${
                      isDark 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg shadow-cyan-500/25' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 shadow-lg shadow-blue-500/25'
                    } text-white`
                  : `${
                      isDark 
                        ? 'bg-gray-700 text-gray-400' 
                        : 'bg-gray-300 text-gray-500'
                    } cursor-not-allowed`
              }`}
            />
          </div>

          {/* Comparison Results */}
          {comparisonResults && (
            <div className={`animate-fade-in-up border-t-2 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } pt-8`}>
              <h4 className={`text-2xl font-bold ${
                isDark ? 'text-cyan-400' : 'text-blue-600'
              } mb-6 text-center`}>
                Comparison Results
              </h4>

              {/* Score Comparison */}
              <div className="mb-8">
                <h5 className={`text-xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-purple-400 to-cyan-400' 
                    : 'from-purple-600 to-blue-600'
                } bg-clip-text text-transparent mb-6 text-center`}>
                  Score Comparison
                </h5>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <Card className={`text-center transform hover:scale-105 transition-all duration-300 ${
                    isDark ? 'bg-gray-800/50' : 'bg-white'
                  } shadow-lg hover:shadow-xl`}>
                    <p className={`${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    } text-sm mb-2 font-medium`}>
                      Resume 1
                    </p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${
                      getScoreGradient(comparisonResults.scoreComparison.resume1)
                    } bg-clip-text text-transparent mb-2`}>
                      {comparisonResults.scoreComparison.resume1}%
                    </p>
                    <div className={`h-2 rounded-full bg-gradient-to-r ${
                      getScoreGradient(comparisonResults.scoreComparison.resume1)
                    } opacity-30`}></div>
                  </Card>
                  
                  <Card className={`text-center transform hover:scale-105 transition-all duration-300 ${
                    isDark ? 'bg-gray-800/50' : 'bg-white'
                  } shadow-lg hover:shadow-xl`}>
                    <p className={`${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    } text-sm mb-2 font-medium`}>
                      Resume 2
                    </p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${
                      getScoreGradient(comparisonResults.scoreComparison.resume2)
                    } bg-clip-text text-transparent mb-2`}>
                      {comparisonResults.scoreComparison.resume2}%
                    </p>
                    <div className={`h-2 rounded-full bg-gradient-to-r ${
                      getScoreGradient(comparisonResults.scoreComparison.resume2)
                    } opacity-30`}></div>
                  </Card>
                </div>
                
                <div className="text-center">
                  <p className={`${
                    isDark ? 'text-gray-100' : 'text-gray-800'
                  } text-lg mb-2`}>
                    Difference: <span className={`font-bold text-2xl bg-gradient-to-r ${
                      isDark 
                        ? 'from-cyan-400 to-purple-400' 
                        : 'from-blue-600 to-purple-600'
                    } bg-clip-text text-transparent`}>
                      {comparisonResults.scoreComparison.difference}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Keyword Comparison */}
              <div>
                <h5 className={`text-xl font-bold bg-gradient-to-r ${
                  isDark 
                    ? 'from-purple-400 to-cyan-400' 
                    : 'from-purple-600 to-blue-600'
                } bg-clip-text text-transparent mb-6 text-center`}>
                  Keyword Comparison
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className={`transform hover:scale-105 transition-all duration-300 ${
                    isDark ? 'bg-gray-800/50' : 'bg-white'
                  } shadow-lg hover:shadow-xl`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-4 h-4 rounded-full ${
                        isDark ? 'bg-cyan-400' : 'bg-blue-500'
                      } mr-3`}></div>
                      <p className={`${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      } font-bold text-lg`}>
                        Unique to Resume 1
                      </p>
                    </div>
                    
                    {comparisonResults.keywordComparison.uniqueToResume1.length === 0 ? (
                      <p className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } italic text-center py-4`}>
                        No unique keywords
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {comparisonResults.keywordComparison.uniqueToResume1.map((keyword, index) => (
                          <li key={keyword} className={`${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          } flex items-center p-2 rounded-lg ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                          } transition-all duration-300 hover:scale-105`}
                          style={{ animationDelay: `${index * 100}ms` }}>
                            <span className={`w-2 h-2 ${
                              isDark ? 'bg-cyan-400' : 'bg-blue-500'
                            } rounded-full mr-3`}></span>
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                  
                  <Card className={`transform hover:scale-105 transition-all duration-300 ${
                    isDark ? 'bg-gray-800/50' : 'bg-white'
                  } shadow-lg hover:shadow-xl`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-4 h-4 rounded-full ${
                        isDark ? 'bg-purple-400' : 'bg-purple-500'
                      } mr-3`}></div>
                      <p className={`${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      } font-bold text-lg`}>
                        Unique to Resume 2
                      </p>
                    </div>
                    
                    {comparisonResults.keywordComparison.uniqueToResume2.length === 0 ? (
                      <p className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } italic text-center py-4`}>
                        No unique keywords
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {comparisonResults.keywordComparison.uniqueToResume2.map((keyword, index) => (
                          <li key={keyword} className={`${
                            isDark ? 'text-gray-200' : 'text-gray-700'
                          } flex items-center p-2 rounded-lg ${
                            isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                          } transition-all duration-300 hover:scale-105`}
                          style={{ animationDelay: `${index * 100}ms` }}>
                            <span className={`w-2 h-2 ${
                              isDark ? 'bg-purple-400' : 'bg-purple-500'
                            } rounded-full mr-3`}></span>
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

ComparisonTool.propTypes = {
  resumes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      matchedKeywords: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
};

export default ComparisonTool;