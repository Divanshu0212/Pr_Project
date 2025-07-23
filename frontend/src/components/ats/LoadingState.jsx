import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import Loader from '../common/Loader';
import Card from '../common/Card';

const LoadingState = ({ message = 'Analyzing your resume...', type = 'spinner' }) => {
  const { isDark } = useTheme();
  const [tipIndex, setTipIndex] = useState(0);

  const loadingTips = [
    "💡 Most ATS systems scan for keywords that match the job description",
    "🎯 Action verbs like 'achieved', 'managed', and 'developed' catch attention",
    "📊 Quantify your achievements with numbers and percentages when possible",
    "🔤 Use both acronyms and full forms (e.g., 'SEO - Search Engine Optimization')",
    "📝 Tailor your resume for each specific job application",
    "⚡ Keep your resume format clean and ATS-friendly"
  ];

  useEffect(() => {
    if (type === 'spinner') {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [type, loadingTips.length]);

  if (type === 'basic-spinner') {
    return (
      <div className={`
        p-6 rounded-xl flex items-center justify-center border-2 
        transition-all duration-500 hover:shadow-2xl animate-slideInUp
        ${isDark 
          ? 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-highlight))] shadow-[0_0_20px_rgba(156,39,176,0.3)]' 
          : 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-accent-primary))] shadow-[0_0_20px_rgba(49,130,206,0.2)]'
        }
      `}>
        {/* Enhanced Spinner */}
        <div className="relative mr-4">
          <svg
            className={`
              animate-spin h-8 w-8 
              ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}
            `}
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          
          {/* Pulsing outer ring */}
          <div className={`
            absolute inset-0 rounded-full border-2 animate-ping
            ${isDark ? 'border-[rgb(var(--color-highlight))]' : 'border-[rgb(var(--color-accent-secondary))]'}
          `} />
        </div>

        <div className="text-center">
          <span className={`
            text-lg font-medium bg-gradient-to-r bg-clip-text text-transparent animate-pulse
            ${isDark 
              ? 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))]' 
              : 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-accent-secondary))]'
            }
          `}>
            {message}
          </span>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-3 space-x-1">
            <div className={`
              w-2 h-2 rounded-full animate-bounce
              ${isDark ? 'bg-[rgb(var(--color-accent-primary))]' : 'bg-[rgb(var(--color-accent-primary))]'}
            `} style={{ animationDelay: '0ms' }} />
            <div className={`
              w-2 h-2 rounded-full animate-bounce
              ${isDark ? 'bg-[rgb(var(--color-highlight))]' : 'bg-[rgb(var(--color-accent-secondary))]'}
            `} style={{ animationDelay: '150ms' }} />
            <div className={`
              w-2 h-2 rounded-full animate-bounce
              ${isDark ? 'bg-[rgb(var(--color-accent-primary))]' : 'bg-[rgb(var(--color-accent-primary))]'}
            `} style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`
      p-8 text-center transition-all duration-500 animate-slideInUp
      ${isDark 
        ? 'bg-gradient-to-br from-[rgb(var(--color-background-primary))] via-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))]' 
        : 'bg-gradient-to-br from-[rgb(var(--color-background-primary))] via-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))]'
      }
      hover:shadow-2xl border-2
      ${isDark 
        ? 'border-[rgb(var(--color-background-secondary))] hover:border-[rgb(var(--color-highlight))]' 
        : 'border-[rgb(var(--color-accent-neutral))] hover:border-[rgb(var(--color-accent-primary))]'
      }
    `}>
      <div className="space-y-8">
        {/* Main Loading Section */}
        <div className="relative">
          {/* Background glow effect */}
          <div className={`
            absolute inset-0 rounded-full opacity-20 animate-pulse
            bg-gradient-to-r 
            ${isDark 
              ? 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-highlight))] to-[rgb(var(--color-accent-primary))]' 
              : 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-accent-secondary))] to-[rgb(var(--color-accent-primary))]'
            }
            blur-xl scale-150
          `} />
          
          <div className="relative z-10">
            <Loader type={type} size="lg" text="" />
            
            <h3 className={`
              text-2xl font-bold mt-6 mb-2
              bg-gradient-to-r bg-clip-text text-transparent
              ${isDark 
                ? 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-highlight))] to-[rgb(var(--color-accent-primary))]' 
                : 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-accent-secondary))] to-[rgb(var(--color-accent-primary))]'
              }
              animate-shimmer bg-size-200
            `}>
              🔍 {message}
            </h3>
            
            {/* Progress indicator */}
            <div className={`
              w-48 h-1 mx-auto rounded-full overflow-hidden
              ${isDark ? 'bg-[rgb(var(--color-background-secondary))]' : 'bg-[rgb(var(--color-accent-neutral))]'}
            `}>
              <div className={`
                h-full rounded-full animate-loading-progress
                bg-gradient-to-r 
                ${isDark 
                  ? 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))]' 
                  : 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-accent-secondary))]'
                }
              `} />
            </div>
          </div>
        </div>

        {/* Loading Tips Section */}
        {type === 'spinner' && (
          <div className={`
            p-6 rounded-xl border-2 border-dashed transition-all duration-500
            ${isDark 
              ? 'border-[rgb(var(--color-background-secondary))] bg-[rgb(var(--color-background-secondary))]/30' 
              : 'border-[rgb(var(--color-accent-neutral))] bg-[rgb(var(--color-background-secondary))]/50'
            }
            animate-slideInLeft
          `}>
            <h4 className={`
              text-lg font-semibold mb-4 flex items-center justify-center gap-2
              ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}
            `}>
              ⏰ While You Wait...
            </h4>
            
            <div className="relative h-16 overflow-hidden">
              <p className={`
                absolute inset-0 flex items-center justify-center text-center
                px-4 leading-relaxed transition-all duration-700 transform
                ${tipIndex >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                ${isDark ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-primary))]'}
                animate-fadeInScale
              `}>
                {loadingTips[tipIndex]}
              </p>
            </div>
            
            {/* Tip indicator dots */}
            <div className="flex justify-center mt-4 space-x-2">
              {loadingTips.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${index === tipIndex 
                      ? isDark 
                        ? 'bg-[rgb(var(--color-accent-primary))] scale-125' 
                        : 'bg-[rgb(var(--color-accent-primary))] scale-125'
                      : isDark 
                        ? 'bg-[rgb(var(--color-background-secondary))]' 
                        : 'bg-[rgb(var(--color-accent-neutral))]'
                    }
                  `}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fun loading animation */}
        <div className="flex justify-center space-x-4">
          {['📄', '🔍', '📊', '✅'].map((emoji, index) => (
            <div
              key={emoji}
              className={`
                text-2xl animate-bounce
                ${isDark ? 'filter brightness-110' : ''}
              `}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'basic-spinner']),
};

export default LoadingState;