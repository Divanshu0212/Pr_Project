import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

const ScoreCard = ({ score, label = "Overall ATS Score", color }) => {
  const { isDark } = useTheme();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animate score counting
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      const increment = score / 50; // 50 steps for smooth animation
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(interval);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (currentScore) => {
    if (currentScore >= 80) {
      return isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]';
    }
    if (currentScore >= 60) {
      return isDark ? 'text-[rgb(var(--color-highlight))]' : 'text-[rgb(var(--color-accent-secondary))]';
    }
    return isDark ? 'text-[rgb(var(--color-accent-error))]' : 'text-[rgb(var(--color-accent-error))]';
  };

  const getGradientColors = (currentScore) => {
    if (currentScore >= 80) {
      return isDark 
        ? 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-highlight))] to-[rgb(var(--color-accent-primary))]'
        : 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-accent-secondary))] to-[rgb(var(--color-accent-primary))]';
    }
    if (currentScore >= 60) {
      return isDark 
        ? 'from-[rgb(var(--color-highlight))] to-[rgb(var(--color-accent-primary))]'
        : 'from-[rgb(var(--color-accent-secondary))] to-[rgb(var(--color-accent-primary))]';
    }
    return 'from-[rgb(var(--color-accent-error))] to-red-400';
  };

  const getScoreEmoji = (currentScore) => {
    if (currentScore >= 90) return '🏆';
    if (currentScore >= 80) return '🎯';
    if (currentScore >= 70) return '👍';
    if (currentScore >= 60) return '📈';
    if (currentScore >= 40) return '⚠️';
    return '🚨';
  };

  const getScoreMessage = (currentScore) => {
    if (currentScore >= 90) return 'Outstanding';
    if (currentScore >= 80) return 'Excellent';
    if (currentScore >= 70) return 'Very Good';
    if (currentScore >= 60) return 'Good';
    if (currentScore >= 40) return 'Fair';
    return 'Needs Work';
  };

  const scoreColorClass = color || getScoreColor(score);
  const gradientClass = getGradientColors(score);

  // Calculate circumference for circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-8 shadow-lg 
      transition-all duration-500 hover:shadow-2xl group
      animate-slideInUp transform hover:scale-105
      ${isDark 
        ? 'bg-gradient-to-br from-[rgb(var(--color-background-primary))] via-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))] border border-[rgb(var(--color-background-secondary))]' 
        : 'bg-gradient-to-br from-[rgb(var(--color-background-primary))] via-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))] border border-[rgb(var(--color-accent-neutral))]'
      }
      hover:border-opacity-60
      ${isDark ? 'hover:border-[rgb(var(--color-accent-primary))]' : 'hover:border-[rgb(var(--color-accent-primary))]'}
    `}>
      
      {/* Background glow effect */}
      <div className={`
        absolute inset-0 opacity-10 bg-gradient-to-r blur-xl
        ${gradientClass}
        group-hover:opacity-20 transition-opacity duration-500
      `} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className={`
            text-xl font-bold mb-2
            bg-gradient-to-r bg-clip-text text-transparent
            ${isDark 
              ? 'from-[rgb(var(--color-text-primary))] to-[rgb(var(--color-accent-primary))]' 
              : 'from-[rgb(var(--color-text-primary))] to-[rgb(var(--color-accent-primary))]'
            }
            animate-shimmer bg-size-200
          `}>
            {label}
          </h3>
          
          <div className={`
            text-2xl animate-bounce
          `}>
            {getScoreEmoji(score)}
          </div>
        </div>
        
        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-40 h-40">
            {/* Outer glow ring */}
            <div className={`
              absolute inset-2 rounded-full opacity-30 animate-pulse
              bg-gradient-to-r ${gradientClass} blur-sm
            `} />
            
            <svg className="w-40 h-40 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={isDark ? 'rgb(var(--color-background-secondary))' : 'rgb(var(--color-accent-neutral))'}
                strokeWidth="6"
                opacity="0.3"
              />
              
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-2000 ease-out animate-draw-circle"
              />
              
              {/* Inner decorative circle */}
              <circle
                cx="50"
                cy="50"
                r="25"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="1"
                opacity="0.5"
                className="animate-spin-slow"
              />
            </svg>
            
            {/* Gradient definitions */}
            <svg className="absolute inset-0 w-0 h-0">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {score >= 80 ? (
                    <>
                      <stop offset="0%" stopColor={isDark ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-accent-primary))'} />
                      <stop offset="50%" stopColor={isDark ? 'rgb(var(--color-highlight))' : 'rgb(var(--color-accent-secondary))'} />
                      <stop offset="100%" stopColor={isDark ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-accent-primary))'} />
                    </>
                  ) : score >= 60 ? (
                    <>
                      <stop offset="0%" stopColor={isDark ? 'rgb(var(--color-highlight))' : 'rgb(var(--color-accent-secondary))'} />
                      <stop offset="100%" stopColor={isDark ? 'rgb(var(--color-accent-primary))' : 'rgb(var(--color-accent-primary))'} />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="rgb(var(--color-accent-error))" />
                      <stop offset="100%" stopColor="#f87171" />
                    </>
                  )}
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`
                  text-5xl font-black mb-1 transition-all duration-300
                  ${scoreColorClass}
                  ${isVisible ? 'animate-scoreCountUp' : ''}
                `}>
                  {animatedScore}
                </div>
                <div className={`
                  text-lg font-medium
                  ${isDark ? 'text-[rgb(var(--color-text-secondary))]' : 'text-[rgb(var(--color-text-secondary))]'}
                `}>
                  / 100
                </div>
              </div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute w-1 h-1 rounded-full opacity-60
                    ${isDark ? 'bg-[rgb(var(--color-accent-primary))]' : 'bg-[rgb(var(--color-accent-primary))]'}
                    animate-float-particle
                  `}
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Score Status */}
        <div className="text-center">
          <div className={`
            inline-block px-6 py-3 rounded-full text-lg font-bold
            bg-gradient-to-r ${gradientClass} text-white
            shadow-lg hover:shadow-xl transition-all duration-300
            transform hover:scale-105 animate-slideInUp
            relative overflow-hidden
          `}>
            <div className="relative z-10">
              {getScoreMessage(score)}
            </div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-fast" />
          </div>
          
          {/* Additional info */}
          <p className={`
            mt-4 text-sm leading-relaxed
            ${isDark ? 'text-[rgb(var(--color-text-secondary))]' : 'text-[rgb(var(--color-text-secondary))]'}
          `}>
            {score >= 80 
              ? "Your resume is highly optimized for ATS systems! 🎉" 
              : score >= 60 
                ? "Good job! A few tweaks can make it even better." 
                : "Let's work together to improve your ATS compatibility."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

ScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
  label: PropTypes.string,
  color: PropTypes.string,
};

export default ScoreCard;