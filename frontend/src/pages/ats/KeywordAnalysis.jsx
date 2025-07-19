import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

const KeywordAnalysis = ({ score, matched, missing }) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      ${isDark 
        ? 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-background-secondary))]' 
        : 'bg-[rgb(var(--color-background-primary))] border-[rgb(var(--color-accent-neutral))]'
      } 
      rounded-xl shadow-lg p-6 border transition-all duration-300 
      hover:shadow-2xl animate-slideInUp
    `}>
      <h2 className={`
        text-2xl font-bold mb-6 bg-gradient-to-r 
        ${isDark 
          ? 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-highlight))]' 
          : 'from-[rgb(var(--color-accent-primary))] to-[rgb(var(--color-accent-secondary))]'
        } 
        bg-clip-text text-transparent animate-pulse
      `}>
        🔍 Keyword Analysis
      </h2>
      
      <div className="space-y-6">
        {/* Score Section */}
        <div className="animate-slideInLeft">
          <div className={`
            flex justify-between items-center mb-3
            ${isDark ? 'text-[rgb(var(--color-text-primary))]' : 'text-[rgb(var(--color-text-primary))]'}
          `}>
            <span className="text-lg font-medium">Keyword Match Score</span>
            <span className={`
              text-2xl font-bold px-4 py-2 rounded-full
              ${isDark 
                ? 'text-[rgb(var(--color-highlight))] bg-[rgb(var(--color-background-secondary))]' 
                : 'text-[rgb(var(--color-accent-secondary))] bg-[rgb(var(--color-background-secondary))]'
              }
              animate-bounce
            `}>
              {score}%
            </span>
          </div>
          
          <div className={`
            h-4 rounded-full overflow-hidden
            ${isDark ? 'bg-[rgb(var(--color-background-secondary))]' : 'bg-[rgb(var(--color-accent-neutral))]'}
          `}>
            <div
              className={`
                h-full rounded-full transition-all duration-1000 ease-out
                bg-gradient-to-r 
                ${isDark 
                  ? 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-highlight))] to-[rgb(var(--color-accent-primary))]' 
                  : 'from-[rgb(var(--color-accent-primary))] via-[rgb(var(--color-accent-secondary))] to-[rgb(var(--color-accent-primary))]'
                }
                animate-shimmer bg-size-200
              `}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Matched Keywords */}
        <div className="animate-slideInRight">
          <h3 className={`
            text-lg font-semibold mb-4 flex items-center gap-2
            ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}
          `}>
            ✅ Matched Keywords
            <span className={`
              text-sm px-2 py-1 rounded-full
              ${isDark 
                ? 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-text-secondary))]' 
                : 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-text-secondary))]'
              }
            `}>
              {matched?.length || 0}
            </span>
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {matched && matched.map((keyword, index) => (
              <span
                key={keyword}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  border-2 transition-all duration-300 
                  hover:scale-105 hover:shadow-lg cursor-default
                  animate-fadeInScale
                  ${isDark 
                    ? 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-accent-primary))] border-[rgb(var(--color-accent-primary))] hover:bg-[rgb(var(--color-accent-primary))] hover:text-[rgb(var(--color-background-primary))]' 
                    : 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-accent-primary))] border-[rgb(var(--color-accent-primary))] hover:bg-[rgb(var(--color-accent-primary))] hover:text-white'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {keyword}
              </span>
            ))}
          </div>
          
          {(!matched || matched.length === 0) && (
            <p className={`
              text-center py-4 rounded-lg border-2 border-dashed
              ${isDark 
                ? 'text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-background-secondary))]' 
                : 'text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-accent-neutral))]'
              }
            `}>
              No matched keywords found
            </p>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="animate-slideInLeft">
          <h3 className={`
            text-lg font-semibold mb-4 flex items-center gap-2
            ${isDark ? 'text-[rgb(var(--color-highlight))]' : 'text-[rgb(var(--color-accent-error))]'}
          `}>
            ❌ Missing Keywords
            <span className={`
              text-sm px-2 py-1 rounded-full
              ${isDark 
                ? 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-text-secondary))]' 
                : 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-text-secondary))]'
              }
            `}>
              {missing?.length || 0}
            </span>
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {missing && missing.map((keyword, index) => (
              <span
                key={keyword}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  border-2 transition-all duration-300 
                  hover:scale-105 hover:shadow-lg cursor-default
                  animate-fadeInScale
                  ${isDark 
                    ? 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-highlight))] border-[rgb(var(--color-highlight))] hover:bg-[rgb(var(--color-highlight))] hover:text-[rgb(var(--color-background-primary))]' 
                    : 'bg-[rgb(var(--color-background-secondary))] text-[rgb(var(--color-accent-error))] border-[rgb(var(--color-accent-error))] hover:bg-[rgb(var(--color-accent-error))] hover:text-white'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {keyword}
              </span>
            ))}
          </div>
          
          {(!missing || missing.length === 0) && (
            <div className={`
              text-center py-6 rounded-lg
              bg-gradient-to-r 
              ${isDark 
                ? 'from-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))]' 
                : 'from-[rgb(var(--color-background-secondary))] to-[rgb(var(--color-background-primary))]'
              }
            `}>
              <span className={`
                text-2xl mb-2 block animate-bounce
              `}>🎉</span>
              <p className={`
                font-medium
                ${isDark ? 'text-[rgb(var(--color-accent-primary))]' : 'text-[rgb(var(--color-accent-primary))]'}
              `}>
                Excellent! No missing keywords detected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

KeywordAnalysis.propTypes = {
  score: PropTypes.number.isRequired,
  matched: PropTypes.arrayOf(PropTypes.string).isRequired,
  missing: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default KeywordAnalysis;