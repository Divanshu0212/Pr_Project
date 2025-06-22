import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const ScoreVisualization = ({ score, categories }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Animate score counting
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 50;
      const counter = setInterval(() => {
        current += increment;
        if (current >= score) {
          current = score;
          clearInterval(counter);
        }
        setAnimatedScore(Math.round(current));
      }, 30);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (value) => {
    if (value >= 80) return '#10B981'; // green-500
    if (value >= 60) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const getScoreGradient = (value) => {
    if (value >= 80) return 'from-green-400 to-green-600';
    if (value >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${circumference * (animatedScore / 100)} ${circumference * (1 - animatedScore / 100)}`;

  return (
    <div className={`transition-all duration-800 ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0'}`}>
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-30"></div>
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-6">
              🎯 Overall ATS Score
            </h3>

            <div className="relative w-52 h-52 animate-scale-in">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="rgb(var(--color-accent-neutral))"
                  strokeWidth="8"
                  opacity="0.3"
                />
                
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={getScoreColor(score)}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-1200 ease-smooth"
                  style={{
                    filter: `drop-shadow(0 0 10px ${getScoreColor(score)}40)`
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className={`text-5xl font-bold bg-gradient-to-br ${getScoreGradient(score)} bg-clip-text text-transparent`}
                >
                  {animatedScore}
                </span>
                <span className="text-text-secondary font-medium">out of 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-bold text-text-primary mb-4">📊 Category Breakdown</h4>

            {categories.map((category, index) => (
              <div 
                key={category.name} 
                className="space-y-3 animate-fade-in-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-text-primary font-semibold">{category.name}</span>
                  <span className={`font-bold bg-gradient-to-r ${getScoreGradient(category.score)} bg-clip-text text-transparent`}>
                    {category.score}/100
                  </span>
                </div>

                <div className="relative w-full bg-background-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(category.score)} transition-all duration-1200 ease-smooth shadow-glow`}
                    style={{
                      width: `${category.score}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <Card className="mt-8 bg-gradient-mesh relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10"></div>
            <div className="relative z-10">
              <h4 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent mb-4">
                💭 Quick Insights
              </h4>

              <div className="space-y-4">
                {score >= 80 ? (
                  <div className="flex items-start group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <span className="text-text-primary font-medium">🎉 Your resume is highly optimized for ATS systems</span>
                  </div>
                ) : score >= 60 ? (
                  <div className="flex items-start group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                    <span className="text-text-primary font-medium">⚡ Your resume has good ATS compatibility with room for improvement</span>
                  </div>
                ) : (
                  <div className="flex items-start group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg">⚠</span>
                    </div>
                    <span className="text-text-primary font-medium">🎯 Your resume needs optimization to pass ATS filters</span>
                  </div>
                )}

                {categories.filter(cat => cat.score < 60).map((category, index) => (
                  <div key={`insight-${category.name}`} className="flex items-start group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <span className="text-text-primary font-medium">
                      Focus on improving your <span className="text-accent-primary font-bold">{category.name.toLowerCase()}</span> score
                    </span>
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

ScoreVisualization.propTypes = {
  score: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ScoreVisualization;