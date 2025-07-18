import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

const SuggestionsList = ({ suggestions }) => {
  const { theme, isDark } = useTheme();
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = itemsRef.current.indexOf(entry.target);
            if (index === -1) {
              // This is the header
              setHeaderVisible(true);
            } else {
              // This is a suggestion item
              setVisibleItems(prev => new Set([...prev, index]));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    itemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [suggestions]);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="opacity-0 animate-fade-in-up">
        <Card className="text-center py-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-cyan-500/5 to-purple-500/5' : 'from-blue-500/5 to-purple-500/5'} animate-gradient-slow`}></div>
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-bounce-gentle">💡</div>
            <p className="text-text-secondary font-medium">No improvement suggestions available yet.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`transition-all duration-1000 transform ${
        headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
        {/* Animated background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-cyan-500/10 via-purple-500/10 to-cyan-500/10' : 'from-blue-500/10 via-purple-500/10 to-blue-500/10'} animate-gradient-xy`}></div>
        
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 ${isDark ? 'bg-cyan-400' : 'bg-blue-400'} rounded-full opacity-10 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-8">
          {/* Enhanced header */}
          <div className="text-center">
            <h3 className={`text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-cyan-400 via-purple-400 to-cyan-400' : 'from-blue-600 via-purple-600 to-blue-600'} bg-clip-text text-transparent animate-gradient-x`}>
              🚀 Improvement Suggestions
            </h3>
            <div className={`w-24 h-1 bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-500 to-purple-500'} mx-auto mt-3 rounded-full animate-pulse-slow`}></div>
            <p className="text-text-secondary mt-2 text-sm">Enhance your resume with these targeted improvements</p>
          </div>

          {/* Suggestions grid */}
          <div className="space-y-6">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={(el) => (itemsRef.current[index] = el)}
                className={`transition-all duration-700 transform ${
                  visibleItems.has(index) 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-0 -translate-x-8 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="group/item relative overflow-hidden">
                  <div className="flex items-start space-x-4 p-6 rounded-2xl bg-background-secondary/70 backdrop-blur-sm border border-accent-neutral/20 hover:border-accent-primary/50 transition-all duration-500 hover:shadow-xl group-hover/item:scale-[1.02] group-hover/item:shadow-2xl">
                    
                    {/* Animated number badge */}
                    <div className="flex-shrink-0 relative group-hover/item:scale-110 transition-transform duration-300">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-500 to-purple-500'} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {index + 1}
                      </div>
                      
                      {/* Pulse ring */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${isDark ? 'from-cyan-400 to-purple-400' : 'from-blue-500 to-purple-500'} animate-ping opacity-20`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <p className="text-text-primary font-medium leading-relaxed group-hover/item:text-accent-primary transition-colors duration-300">
                        {suggestion.text}
                      </p>
                      
                      {suggestion.example && (
                        <div className="relative overflow-hidden">
                          <div className="bg-background-primary/60 backdrop-blur-sm p-4 rounded-xl border-l-4 border-accent-secondary shadow-inner">
                            <p className="text-sm text-text-secondary">
                              <span className="font-semibold text-accent-secondary bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent">
                                Example:
                              </span>{' '}
                              <span className="italic text-text-primary font-medium">
                                {suggestion.example}
                              </span>
                            </p>
                          </div>
                          
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slow"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover indicators */}
                    <div className="flex flex-col items-center space-y-2 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                      <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-blue-500'} animate-pulse`}></div>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-500'} animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                  
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${isDark ? 'from-cyan-400/20 to-purple-400/20' : 'from-blue-500/20 to-purple-500/20'} opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 blur-xl -z-10`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom accent with animation */}
          <div className="relative">
            <div className={`h-1 bg-gradient-to-r ${isDark ? 'from-transparent via-cyan-400 to-transparent' : 'from-transparent via-blue-500 to-transparent'} rounded-full animate-pulse-slow`}></div>
            <div className={`absolute inset-0 h-1 bg-gradient-to-r ${isDark ? 'from-transparent via-purple-400 to-transparent' : 'from-transparent via-purple-500 to-transparent'} rounded-full animate-pulse-slow`} style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Floating action hint */}
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 text-text-secondary text-sm bg-background-secondary/50 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-neutral/20 animate-bounce-gentle`}>
              <span>✨</span>
              <span>Hover over suggestions for enhanced view</span>
              <span>✨</span>
            </div>
          </div>
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