import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import Card from '../common/Card';
import Button from '../common/Button';

const KeywordMatch = ({ keywords, resumeContent }) => {
  const { theme, isDark } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const matchedKeywords = keywords.filter(kw => kw.found);
  const matchPercentage = Math.round((matchedKeywords.length / keywords.length) * 100);

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return b.found - a.found;
  });

  const displayKeywords = showAll ? sortedKeywords : sortedKeywords.slice(0, 8);

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBorder = (score) => {
    if (score >= 70) return 'border-green-400 shadow-green-400/20';
    if (score >= 40) return 'border-yellow-400 shadow-yellow-400/20';
    return 'border-red-400 shadow-red-400/20';
  };

  const getFeedbackMessage = (score) => {
    if (score >= 70) return {
      text: "🎉 Excellent! Your resume is highly optimized for ATS systems",
      gradient: "from-green-400 to-emerald-400"
    };
    if (score >= 40) return {
      text: "⚡ Good progress! Consider adding more relevant keywords",
      gradient: "from-yellow-400 to-orange-400"
    };
    return {
      text: "🎯 Needs improvement! Add missing keywords to boost your chances",
      gradient: "from-red-400 to-pink-400"
    };
  };

  const feedback = getFeedbackMessage(matchPercentage);

  return (
    <div className={`transition-all duration-800 transform ${isVisible ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6 animate-pulse-slow">
            Keyword Analysis
          </h3>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-6">
            <div className="flex items-center animate-scale-in">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${getScoreBorder(matchPercentage)} relative overflow-hidden shadow-lg`}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse-slow"></div>
                <span className={`text-2xl font-bold ${getScoreColor(matchPercentage)} relative z-10 animate-pulse`}>
                  {matchPercentage}%
                </span>
              </div>
              <div className="ml-6">
                <h4 className={`font-bold text-xl ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Keyword Match</h4>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-semibold text-cyan-400">{matchedKeywords.length}</span> of {keywords.length} keywords found
                </p>
              </div>
            </div>

            <Card className={`p-4 max-w-md relative overflow-hidden ${isDark ? 'bg-gray-800/80' : 'bg-white'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
              <div className="relative z-10">
                <p className={`font-medium bg-gradient-to-r ${feedback.gradient} bg-clip-text text-transparent`}>
                  {feedback.text}
                </p>
              </div>
            </Card>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cyan-400/20 shadow-xl">
            <div className={`p-4 ${isDark ? 'bg-gray-800/80' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-3 gap-4 font-semibold text-sm uppercase tracking-wider">
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Keyword</div>
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</div>
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Importance</div>
              </div>
            </div>
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {displayKeywords.map((keyword, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-3 gap-4 p-4 transition-all duration-300 transform hover:scale-105 animate-slide-in-right ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{keyword.text}</div>
                  <div>
                    {keyword.found ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg animate-pulse-slow">
                        ✓ Found
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg">
                        ✗ Missing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {Array(keyword.importance).fill().map((_, i) => (
                      <div key={i} className="w-4 h-4 mr-1">
                        <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse-slow shadow-md"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {keywords.length > 8 && (
            <div className="mt-6 text-center">
              <Button
                text={showAll ? 'Show Less' : `Show All Keywords (${keywords.length})`}
                onClick={() => setShowAll(!showAll)}
                className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              />
            </div>
          )}

          <Card className="mt-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h4 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4 animate-glow">
                💡 How To Improve
              </h4>
              <div className="space-y-4">
                {[
                  "Include missing keywords naturally in your resume, especially high-importance ones",
                  "Use exact matches when possible, rather than variations or synonyms",
                  "Place important keywords in section headings and bullet points",
                  "Include both spelled-out terms and acronyms (e.g., \"Application Tracking System (ATS)\")"
                ].map((tip, index) => (
                  <div key={index} className="flex items-start group animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
                    </div>
                    <p className={`font-medium leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

KeywordMatch.propTypes = {
  keywords: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      found: PropTypes.bool.isRequired,
      importance: PropTypes.number.isRequired,
    })
  ).isRequired,
  resumeContent: PropTypes.string.isRequired,
};

export default KeywordMatch;