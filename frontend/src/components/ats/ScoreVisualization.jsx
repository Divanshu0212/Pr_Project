import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

const ScoreVisualization = ({ score, categories }) => {
  const { theme, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [categoryAnimations, setCategoryAnimations] = useState({});
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

            // Animate categories with staggered delays
            const categoryTimers = categories.map((_, index) => {
              return setTimeout(() => {
                setCategoryAnimations(prev => ({
                  ...prev,
                  [index]: true
                }));
              }, 600 + (index * 200));
            });

            return () => {
              clearTimeout(timer);
              categoryTimers.forEach(timer => clearTimeout(timer));
            };
          }
        });
      },
      { threshold: 0.3 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, [score, categories]);

  const getScoreColor = (value) => {
    if (value >= 80) return isDark ? '#00FFFF' : '#10B981'; // Cyan in dark, green in light
    if (value >= 60) return isDark ? '#9C27B0' : '#F59E0B'; // Purple in dark, yellow in light
    return '#EF4444'; // Red remains same
  };

  const getScoreGradient = (value) => {
    if (value >= 80) return isDark ? 'from-cyan-400 to-cyan-600' : 'from-green-400 to-green-600';
    if (value >= 60) return isDark ? 'from-purple-400 to-purple-600' : 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${circumference * (animatedScore / 100)} ${circumference * (1 - animatedScore / 100)}`;

  return (
    <div 
      ref={componentRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-500/10' : 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10'} animate-gradient-xy`}></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${isDark ? 'bg-cyan-400' : 'bg-blue-400'} rounded-full opacity-20 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <h3 className={`text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-cyan-400 via-purple-400 to-cyan-400' : 'from-blue-600 via-purple-600 to-blue-600'} bg-clip-text text-transparent mb-6 animate-gradient-x`}>
              🎯 Overall ATS Score
            </h3>

            <div className="relative w-52 h-52 group-hover:scale-110 transition-transform duration-700 ease-out">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-2xl" viewBox="0 0 100 100">
                {/* Glow effect background */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={`rgb(var(--color-accent-neutral))`}
                  strokeWidth="8"
                  opacity="0.2"
                />
                
                {/* Animated progress circle */}
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
                  className="transition-all duration-1500 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 15px ${getScoreColor(score)}60)`,
                    animation: 'glow-pulse 2s ease-in-out infinite alternate'
                  }}
                />
              </svg>

              {/* Score display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className={`text-5xl font-bold bg-gradient-to-br ${getScoreGradient(score)} bg-clip-text text-transparent animate-pulse-slow`}
                  style={{
                    textShadow: `0 0 20px ${getScoreColor(score)}40`
                  }}
                >
                  {animatedScore}
                </span>
                <span className="text-text-secondary font-medium text-sm mt-1">out of 100</span>
                
                {/* Animated sparkles */}
                {score >= 80 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-yellow-400 animate-twinkle"
                        style={{
                          left: `${25 + Math.random() * 50}%`,
                          top: `${25 + Math.random() * 50}%`,
                          animationDelay: `${i * 0.5}s`
                        }}
                      >
                        ✨
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className={`text-xl font-bold bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent mb-4`}>
              📊 Category Breakdown
            </h4>

            {categories.map((category, index) => (
              <div 
                key={category.name} 
                className={`space-y-3 transition-all duration-700 transform ${
                  categoryAnimations[index] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-text-primary font-semibold text-sm">{category.name}</span>
                  <span className={`font-bold bg-gradient-to-r ${getScoreGradient(category.score)} bg-clip-text text-transparent`}>
                    {category.score}/100
                  </span>
                </div>

                <div className="relative w-full bg-background-secondary rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(category.score)} transition-all duration-1200 ease-out shadow-lg`}
                    style={{
                      width: categoryAnimations[index] ? `${category.score}%` : '0%',
                      boxShadow: `0 0 10px ${getScoreColor(category.score)}40`
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced insights card */}
          <Card className="mt-8 relative overflow-hidden group/insights">
            <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-cyan-500/5 via-purple-500/5 to-cyan-500/5' : 'from-blue-500/5 via-purple-500/5 to-blue-500/5'} animate-gradient-slow`}></div>
            
            <div className="relative z-10">
              <h4 className={`text-xl font-bold bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent mb-4 animate-gradient-x`}>
                💭 Quick Insights
              </h4>

              <div className="space-y-4">
                {score >= 80 ? (
                  <div className="flex items-start group/insight hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-4 shadow-lg animate-bounce-gentle">
                      <span className="text-white text-lg">✓</span>
                    </div>
                    <span className="text-text-primary font-medium">🎉 Your resume is highly optimized for ATS systems</span>
                  </div>
                ) : score >= 60 ? (
                  <div className="flex items-start group/insight hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center mr-4 shadow-lg animate-bounce-gentle">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                    <span className="text-text-primary font-medium">⚡ Your resume has good ATS compatibility with room for improvement</span>
                  </div>
                ) : (
                  <div className="flex items-start group/insight hover:scale-105 transition-transform duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center mr-4 shadow-lg animate-bounce-gentle">
                      <span className="text-white text-lg">⚠</span>
                    </div>
                    <span className="text-text-primary font-medium">🎯 Your resume needs optimization to pass ATS filters</span>
                  </div>
                )}

                {categories.filter(cat => cat.score < 60).map((category, index) => (
                  <div key={`insight-${category.name}`} className="flex items-start group/insight hover:scale-105 transition-transform duration-300">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-500 to-purple-500'} flex items-center justify-center mr-4 shadow-lg animate-bounce-gentle`}>
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