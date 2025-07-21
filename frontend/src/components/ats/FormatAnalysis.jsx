import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const FormatAnalysis = ({ format }) => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!format) return null;

  const ScoreBar = ({ score, color = 'cyan' }) => (
    <div className="h-3 rounded-full overflow-hidden shadow-inner" 
         style={{ backgroundColor: 'rgb(22, 27, 34)' }}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out animate-shimmer`}
        style={{ 
          width: isVisible ? `${score}%` : '0%',
          background: color === 'cyan' 
            ? 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)'
            : 'linear-gradient(135deg, #FF4444 0%, #FF8888 100%)',
          backgroundSize: '200% 100%'
        }}
      />
    </div>
  );

  const SectionBadge = ({ section, type = 'found' }) => (
    <span className={`
      inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
      transition-all duration-300 hover:scale-105 hover:shadow-glow cursor-default
      animate-fade-in-scale backdrop-blur-sm
      ${type === 'found' 
        ? 'text-white border' 
        : 'text-white border'
      }
    `}
    style={{
      background: type === 'found' 
        ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(156, 39, 176, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 136, 136, 0.2) 100%)',
      borderColor: type === 'found' ? '#00FFFF' : '#FF4444'
    }}>
      {section}
    </span>
  );

  return (
    <div ref={componentRef} className={`
      group relative overflow-hidden rounded-2xl p-6 
      border shadow-xl hover:shadow-2xl
      transition-all duration-500 ease-out
      transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      hover:scale-[1.02] hover:-translate-y-1
    `}
    style={{
      background: 'linear-gradient(145deg, rgb(22, 27, 34) 0%, rgb(13, 17, 23) 100%)',
      borderColor: 'rgba(0, 255, 255, 0.3)'
    }}>
      {/* Animated mesh background */}
      <div className="absolute inset-0 opacity-20 animate-gradient-shift" 
           style={{
             background: `
               radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.3) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.3) 0%, transparent 50%)
             `
           }} />
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{
             background: 'linear-gradient(45deg, #00FFFF, #9C27B0, #00FFFF)',
             backgroundSize: '400% 400%',
             animation: 'gradient-shift 3s ease-in-out infinite',
             padding: '1px',
             mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
             maskComposite: 'subtract'
           }} />
      
      {/* Content */}
      <div className="relative space-y-6 z-10">
        {/* Header */}
        <div className={`flex items-center gap-3 transform transition-all duration-700 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-float shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)'
               }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent animate-text-glow"
              style={{
                background: 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}>
            Format Analysis
          </h2>
        </div>

        {/* Format Score */}
        {format.compatibility !== undefined && (
          <div className={`space-y-4 transform transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold" style={{ color: '#E5E5E5' }}>
                Format Score
              </span>
              <span className="text-3xl font-bold bg-clip-text text-transparent animate-counter"
                    style={{
                      background: 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text'
                    }}>
                {format.compatibility}%
              </span>
            </div>
            <ScoreBar score={format.compatibility} />
            <div className="text-sm font-medium" 
                 style={{ color: format.compatibility >= 80 ? '#00FFFF' : format.compatibility >= 60 ? '#9C27B0' : '#FF4444' }}>
              {format.compatibility >= 80 ? 'Excellent Format' : 
               format.compatibility >= 60 ? 'Good Format' : 
               'Needs Improvement'}
            </div>
          </div>
        )}

        {/* Sections */}
        {format.sections && (
          <div className={`space-y-6 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Found Sections */}
            {format.sections.found && format.sections.found.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3" style={{ color: '#E5E5E5' }}>
                  <div className="w-3 h-3 rounded-full animate-pulse-glow"
                       style={{ backgroundColor: '#00FFFF', boxShadow: '0 0 10px #00FFFF' }} />
                  <span className="bg-clip-text text-transparent"
                        style={{
                          background: 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text'
                        }}>
                    Found Sections
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {format.sections.found.map((section, index) => (
                    <div key={section} 
                         className="animate-slide-in-left"
                         style={{ animationDelay: `${index * 0.1}s` }}>
                      <SectionBadge section={section} type="found" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Sections */}
            {format.sections.missing && format.sections.missing.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-3" style={{ color: '#E5E5E5' }}>
                  <div className="w-3 h-3 rounded-full animate-pulse-glow"
                       style={{ backgroundColor: '#FF4444', boxShadow: '0 0 10px #FF4444' }} />
                  <span style={{ color: '#FF4444' }}>Missing Sections</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {format.sections.missing.map((section, index) => (
                    <div key={section} 
                         className="animate-slide-in-right"
                         style={{ animationDelay: `${index * 0.1}s` }}>
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
          <div className={`space-y-4 transform transition-all duration-700 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: '#E5E5E5' }}>
              <div className="w-3 h-3 rounded-full animate-pulse-glow"
                   style={{ backgroundColor: '#FF4444', boxShadow: '0 0 10px #FF4444' }} />
              <span style={{ color: '#FF4444' }}>Format Issues</span>
            </h3>
            <div className="space-y-3">
              {format.issues.map((issue, index) => (
                <div key={index} 
                     className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-sm border animate-slide-in-up hover:scale-[1.02] transition-all duration-300"
                     style={{ 
                       background: 'rgba(22, 27, 34, 0.8)',
                       borderColor: 'rgba(255, 68, 68, 0.3)',
                       animationDelay: `${index * 0.1}s`
                     }}>
                  <div className="w-2 h-2 rounded-full mt-2 animate-pulse-slow flex-shrink-0"
                       style={{ backgroundColor: '#FF4444' }} />
                  <p className="text-sm leading-relaxed font-medium" style={{ color: '#E5E5E5' }}>
                    {issue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {format.recommendations && format.recommendations.length > 0 && (
          <div className={`space-y-4 transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: '#E5E5E5' }}>
              <div className="w-3 h-3 rounded-full animate-pulse-glow"
                   style={{ backgroundColor: '#00FFFF', boxShadow: '0 0 10px #00FFFF' }} />
              <span className="bg-clip-text text-transparent"
                    style={{
                      background: 'linear-gradient(135deg, #00FFFF 0%, #9C27B0 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text'
                    }}>
                Recommendations
              </span>
            </h3>
            <div className="space-y-3">
              {format.recommendations.map((rec, index) => (
                <div key={index} 
                     className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-sm border animate-slide-in-up hover:scale-[1.02] transition-all duration-300 hover:shadow-glow"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                       borderColor: 'rgba(0, 255, 255, 0.3)',
                       animationDelay: `${index * 0.1}s`
                     }}>
                  <div className="w-2 h-2 rounded-full mt-2 animate-pulse-slow flex-shrink-0"
                       style={{ backgroundColor: '#00FFFF' }} />
                  <p className="text-sm leading-relaxed font-medium" style={{ color: '#E5E5E5' }}>
                    {rec}
                  </p>
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