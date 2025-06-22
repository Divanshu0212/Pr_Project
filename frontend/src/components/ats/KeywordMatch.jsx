import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import Button from '../common/Button';

const KeywordMatch = ({ keywords, resumeContent }) => {
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const matchedKeywords = keywords.filter(kw => kw.found);
  const matchPercentage = Math.round((matchedKeywords.length / keywords.length) * 100);

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    return b.found - a.found;
  });

  const displayKeywords = showAll ? sortedKeywords : sortedKeywords.slice(0, 8);

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBorder = (score) => {
    if (score >= 70) return 'border-green-400';
    if (score >= 40) return 'border-yellow-400';
    return 'border-red-400';
  };

  return (
    <div className={`transition-all duration-800 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-6">
            Keyword Analysis
          </h3>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-6">
            <div className="flex items-center animate-scale-in">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${getScoreBorder(matchPercentage)} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20"></div>
                <span className={`text-2xl font-bold ${getScoreColor(matchPercentage)} relative z-10`}>
                  {matchPercentage}%
                </span>
              </div>
              <div className="ml-6">
                <h4 className="text-text-primary font-bold text-xl">Keyword Match</h4>
                <p className="text-text-secondary">
                  <span className="font-semibold text-accent-primary">{matchedKeywords.length}</span> of {keywords.length} keywords found
                </p>
              </div>
            </div>

            <Card className="bg-gradient-card-light dark:bg-gradient-card-dark p-4 max-w-md">
              <p className="text-text-primary font-medium">
                {matchPercentage >= 70 ? (
                  <span className="text-green-400">🎉 Excellent! Your resume is highly optimized for ATS systems</span>
                ) : matchPercentage >= 40 ? (
                  <span className="text-yellow-400">⚡ Good progress! Consider adding more relevant keywords</span>
                ) : (
                  <span className="text-red-400">🎯 Needs improvement! Add missing keywords to boost your chances</span>
                )}
              </p>
            </Card>
          </div>

          <div className="overflow-hidden rounded-2xl border border-accent-neutral/30 shadow-card">
            <div className="bg-background-secondary p-4">
              <div className="grid grid-cols-3 gap-4 font-semibold text-text-secondary text-sm uppercase tracking-wider">
                <div>Keyword</div>
                <div>Status</div>
                <div>Importance</div>
              </div>
            </div>
            <div className="divide-y divide-accent-neutral/20">
              {displayKeywords.map((keyword, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-3 gap-4 p-4 hover:bg-background-secondary/50 transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="font-semibold text-text-primary">{keyword.text}</div>
                  <div>
                    {keyword.found ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-glow">
                        ✓ Found
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-400 to-red-500 text-white">
                        ✗ Missing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {Array(keyword.importance).fill().map((_, i) => (
                      <div key={i} className="w-4 h-4 mr-1">
                        <div className="w-full h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full animate-pulse-slow"></div>
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
                className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:shadow-glow transform hover:scale-105 transition-all duration-300"
              />
            </div>
          )}

          <Card className="mt-8 bg-gradient-mesh relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10"></div>
            <div className="relative z-10">
              <h4 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-4">
                💡 How To Improve
              </h4>
              <div className="space-y-4">
                {[
                  "Include missing keywords naturally in your resume, especially high-importance ones",
                  "Use exact matches when possible, rather than variations or synonyms",
                  "Place important keywords in section headings and bullet points",
                  "Include both spelled-out terms and acronyms (e.g., \"Application Tracking System (ATS)\")"
                ].map((tip, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-text-primary font-medium leading-relaxed">{tip}</p>
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