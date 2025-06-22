import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const SuggestionsList = ({ suggestions }) => {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = `${index * 0.1}s`;
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    itemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [suggestions]);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="opacity-0 animate-fade-in-up">
        <Card className="text-center py-8">
          <div className="text-6xl mb-4">💡</div>
          <p className="text-text-secondary">No improvement suggestions available yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="opacity-0 animate-fade-in-up">
      <Card className="backdrop-blur-sm bg-gradient-card-dark border border-accent-neutral/20">
        <div className="space-y-6">
          {/* Header with gradient text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-clip-text text-transparent animate-gradient-x">
              🚀 Improvement Suggestions
            </h3>
            <div className="w-20 h-1 bg-gradient-to-r from-accent-primary to-accent-secondary mx-auto mt-2 rounded-full"></div>
          </div>

          {/* Suggestions list */}
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={(el) => (itemsRef.current[index] = el)}
                className="opacity-0 group"
              >
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-background-secondary/50 border border-accent-neutral/10 hover:border-accent-primary/30 transition-all duration-400 hover:shadow-glow group-hover:scale-[1.02]">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm animate-bounce-gentle">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <p className="text-text-primary font-medium leading-relaxed group-hover:text-accent-primary transition-colors duration-300">
                      {suggestion.text}
                    </p>
                    
                    {suggestion.example && (
                      <div className="bg-background-primary/50 p-3 rounded-lg border-l-4 border-accent-secondary">
                        <p className="text-sm text-text-secondary">
                          <span className="font-semibold text-accent-secondary">Example:</span>{' '}
                          <span className="italic text-text-primary">{suggestion.example}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom gradient accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-accent-primary to-transparent rounded-full opacity-50"></div>
        </div>
      </Card>
    </div>
  );
};

SuggestionsList.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      example: PropTypes.string,
    })
  ).isRequired,
};

export default SuggestionsList;