import React from 'react';
import PropTypes from 'prop-types';

const FormatAnalysis = ({ format }) => {
  if (!format) return null;

  const ScoreBar = ({ score, color = 'accent-primary' }) => (
    <div className="h-3 bg-background-secondary rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full bg-gradient-to-r from-${color} to-accent-secondary rounded-full 
          transition-all duration-800 ease-smooth animate-shimmer`}
        style={{ 
          width: `${score}%`,
          backgroundSize: '200% 100%'
        }}
      />
    </div>
  );

  const SectionBadge = ({ section, type = 'found' }) => (
    <span className={`
      px-3 py-2 rounded-full text-sm font-medium
      transition-all duration-300 hover:scale-105 cursor-default
      ${type === 'found' 
        ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary border border-accent-primary/30' 
        : 'bg-gradient-to-r from-accent-error/20 to-red-400/20 text-accent-error border border-accent-error/30'
      }
    `}>
      {section}
    </span>
  );

  return (
    <div className="
      group relative overflow-hidden rounded-2xl p-6 
      bg-gradient-card-light dark:bg-gradient-card-dark
      border border-accent-neutral/20 dark:border-accent-neutral/10
      shadow-card dark:shadow-card-dark
      hover:shadow-hover dark:hover:shadow-hover-dark
      transition-all duration-400 ease-smooth
      animate-fade-in-up
    ">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 animate-float" />
      
      {/* Content */}
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center animate-bounce-gentle">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            Format Analysis
          </h2>
        </div>

        {/* Format Score */}
        {format.compatibility !== undefined && (
          <div className="space-y-3 animate-fade-in-up-delay-100">
            <div className="flex justify-between items-center">
              <span className="text-text-primary font-medium">Format Score</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                {format.compatibility}%
              </span>
            </div>
            <ScoreBar score={format.compatibility} />
          </div>
        )}

        {/* Sections */}
        {format.sections && (
          <div className="space-y-4 animate-fade-in-up-delay-200">
            {/* Found Sections */}
            {format.sections.found && format.sections.found.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse-slow" />
                  Found Sections
                </h3>
                <div className="flex flex-wrap gap-2">
                  {format.sections.found.map((section, index) => (
                    <div key={section} className="animate-fade-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                      <SectionBadge section={section} type="found" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Sections */}
            {format.sections.missing && format.sections.missing.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-error rounded-full animate-pulse-slow" />
                  Missing Sections
                </h3>
                <div className="flex flex-wrap gap-2">
                  {format.sections.missing.map((section, index) => (
                    <div key={section} className="animate-fade-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                      <SectionBadge section={section} type="missing" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Issues */}
        {format.issues && format.issues.length > 0 && (
          <div className="space-y-3 animate-fade-in-up-delay-300">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-error rounded-full animate-pulse-slow" />
              Format Issues
            </h3>
            <div className="space-y-2">
              {format.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background-secondary/50 animate-fade-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-1.5 h-1.5 bg-accent-error rounded-full mt-2 animate-pulse-slow" />
                  <p className="text-text-secondary text-sm leading-relaxed">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {format.recommendations && format.recommendations.length > 0 && (
          <div className="space-y-3 animate-fade-in-up-delay-400">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse-slow" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {format.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/20 animate-fade-in-right" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-1.5 h-1.5 bg-accent-primary rounded-full mt-2 animate-pulse-slow" />
                  <p className="text-text-secondary text-sm leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FormatAnalysis.propTypes = {
  format: PropTypes.shape({
    compatibility: PropTypes.number,
    sections: PropTypes.shape({
      found: PropTypes.arrayOf(PropTypes.string),
      missing: PropTypes.arrayOf(PropTypes.string),
    }),
    issues: PropTypes.arrayOf(PropTypes.string),
    recommendations: PropTypes.arrayOf(PropTypes.string),
    isCompatible: PropTypes.bool,
    type: PropTypes.string,
  }),
};

export default FormatAnalysis;