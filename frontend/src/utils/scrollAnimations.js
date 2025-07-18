// utils/scrollAnimations.js - Enhanced with replay functionality
import React, { useState, useEffect, useRef } from 'react';

export const initScrollAnimations = (options = {}) => {
  const config = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    enableReplay: true, // New option for replay functionality
    replayThreshold: 0.3, // How much element needs to be visible for replay
    enableParallax: false,
    staggerDelay: 100,
    ...options
  };

  const observerOptions = {
    threshold: config.enableReplay ? [0, config.threshold, config.replayThreshold] : config.threshold,
    rootMargin: config.rootMargin
  };

  // Track animated elements for replay
  const animatedElements = new Map();
  const parallaxElements = [];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const element = entry.target;
      const isVisible = entry.isIntersecting;
      const intersectionRatio = entry.intersectionRatio;

      // Store element state for replay functionality
      if (!animatedElements.has(element)) {
        animatedElements.set(element, {
          hasAnimated: false,
          isVisible: false,
          lastRatio: 0
        });
      }

      const elementState = animatedElements.get(element);
      const wasVisible = elementState.isVisible;
      
      // Update element state
      elementState.isVisible = isVisible;
      elementState.lastRatio = intersectionRatio;

      if (isVisible && intersectionRatio >= config.threshold) {
        // Element is entering viewport
        if (!elementState.hasAnimated || config.enableReplay) {
          element.classList.add('visible');
          element.classList.remove('animate-out');
          
          // Add stagger effect for children if needed
          if (element.classList.contains('stagger-children')) {
            const children = element.querySelectorAll('.glide-in, .glide-in-left, .glide-in-right, .glide-in-scale, .fade-in, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('visible');
                child.classList.remove('animate-out');
              }, index * config.staggerDelay);
            });
          }
          
          elementState.hasAnimated = true;
        }
      } else if (config.enableReplay && wasVisible && intersectionRatio < config.threshold) {
        // Element is leaving viewport - add exit animation
        element.classList.remove('visible');
        element.classList.add('animate-out');
        
        // Handle staggered children exit
        if (element.classList.contains('stagger-children')) {
          const children = element.querySelectorAll('.glide-in, .glide-in-left, .glide-in-right, .glide-in-scale, .fade-in, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.remove('visible');
              child.classList.add('animate-out');
            }, index * (config.staggerDelay / 2)); // Faster exit
          });
        }
      }

      // Update stored state
      animatedElements.set(element, elementState);
    });
  }, observerOptions);

  // Parallax effect handler
  const handleParallax = () => {
    if (!config.enableParallax) return;
    
    const scrollY = window.scrollY;
    
    parallaxElements.forEach(({ element, speed = 0.5, direction = 'up' }) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        const yPos = scrollY * speed;
        const transform = direction === 'up' 
          ? `translateY(${yPos}px)` 
          : `translateY(${-yPos}px)`;
        element.style.transform = transform;
      }
    });
  };

  // Scroll progress indicator
  const updateScrollProgress = () => {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollProgressVertical = document.querySelector('.scroll-progress-vertical');
    
    if (scrollProgress || scrollProgressVertical) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
      }
      if (scrollProgressVertical) {
        scrollProgressVertical.style.height = `${progress}%`;
      }
    }
  };

  // Throttled scroll handler
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        updateScrollProgress();
        ticking = false;
      });
      ticking = true;
    }
  };

  // Observe all elements with scroll animation classes
  const animatedElementsNodeList = document.querySelectorAll(
    '.glide-in, .glide-in-left, .glide-in-right, .glide-in-scale, .fade-in, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate, .scroll-reveal-flip, .scroll-reveal-zoom, .stagger-children'
  );
  
  animatedElementsNodeList.forEach(el => {
    observer.observe(el);
    
    // Setup parallax if element has parallax class
    if (el.classList.contains('scroll-parallax')) {
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.5;
      const direction = el.dataset.parallaxDirection || 'up';
      parallaxElements.push({ element: el, speed, direction });
    }
  });

  // Add scroll listener for parallax and progress
  if (config.enableParallax || document.querySelector('.scroll-progress, .scroll-progress-vertical')) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  return {
    observer,
    destroy: () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    }
  };
};

// Enhanced hook for React components with replay functionality
export const useScrollAnimations = (options = {}) => {
  const [animationManager, setAnimationManager] = useState(null);

  useEffect(() => {
    const manager = initScrollAnimations({
      enableReplay: true,
      enableParallax: true,
      ...options
    });
    setAnimationManager(manager);

    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, []);

  return animationManager;
};

// Enhanced higher-order component with replay support
export const withScrollAnimation = (WrappedComponent, animationType = 'glide-in', options = {}) => {
  return function WithScrollAnimationComponent(props) {
    const elementRef = useRef(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const config = {
        enableReplay: true,
        threshold: 0.1,
        replayThreshold: 0.3,
        ...options
      };

      const observerOptions = {
        threshold: [0, config.threshold, config.replayThreshold],
        rootMargin: '0px 0px -50px 0px'
      };

      let hasAnimated = false;
      let isVisible = false;

      const observer = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;
          const ratio = entry.intersectionRatio;

          if (isVisible && ratio >= config.threshold) {
            if (!hasAnimated || config.enableReplay) {
              entry.target.classList.add('visible');
              entry.target.classList.remove('animate-out');
              hasAnimated = true;
            }
          } else if (config.enableReplay && wasVisible && ratio < config.threshold) {
            entry.target.classList.remove('visible');
            entry.target.classList.add('animate-out');
          }
        },
        observerOptions
      );

      element.classList.add(animationType);
      observer.observe(element);

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={elementRef}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

// Enhanced utility function with replay support
export const addScrollAnimation = (element, animationType = 'glide-in', options = {}) => {
  if (!element) return;

  const config = {
    enableReplay: true,
    threshold: 0.1,
    replayThreshold: 0.3,
    ...options
  };

  const observerOptions = {
    threshold: config.enableReplay ? [0, config.threshold, config.replayThreshold] : config.threshold,
    rootMargin: '0px 0px -50px 0px'
  };

  let hasAnimated = false;
  let isVisible = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const wasVisible = isVisible;
      isVisible = entry.isIntersecting;
      const ratio = entry.intersectionRatio;

      if (isVisible && ratio >= config.threshold) {
        if (!hasAnimated || config.enableReplay) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('animate-out');
          hasAnimated = true;
        }
      } else if (config.enableReplay && wasVisible && ratio < config.threshold) {
        entry.target.classList.remove('visible');
        entry.target.classList.add('animate-out');
      }
    },
    observerOptions
  );

  element.classList.add(animationType);
  observer.observe(element);

  return observer;
};

// New utility functions for advanced animations
export const createScrollProgressIndicator = (container = document.body) => {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  container.appendChild(progressBar);

  return progressBar;
};

export const createParallaxEffect = (element, speed = 0.5, direction = 'up') => {
  if (!element) return;

  element.classList.add('scroll-parallax');
  element.dataset.parallaxSpeed = speed.toString();
  element.dataset.parallaxDirection = direction;

  // Add to existing parallax system if initScrollAnimations has been called
  const handleParallax = () => {
    const scrollY = window.scrollY;
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      const yPos = scrollY * speed;
      const transform = direction === 'up' 
        ? `translateY(${yPos}px)` 
        : `translateY(${-yPos}px)`;
      element.style.transform = transform;
    }
  };

  let ticking = false;
  const scrollHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleParallax();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', scrollHandler);
  };
};

// Batch animation utility for performance
export const batchScrollAnimations = (elements, animationType = 'glide-in', options = {}) => {
  const observers = [];
  
  elements.forEach(element => {
    if (element) {
      const observer = addScrollAnimation(element, animationType, options);
      observers.push(observer);
    }
  });

  return {
    destroy: () => {
      observers.forEach(observer => observer.disconnect());
    }
  };
};

// Performance monitoring
export const measureScrollAnimationPerformance = () => {
  const startTime = performance.now();
  let frameCount = 0;
  
  const measureFrame = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      console.log(`Scroll Animation FPS: ${fps}`);
      frameCount = 0;
    }
    
    requestAnimationFrame(measureFrame);
  };
  
  requestAnimationFrame(measureFrame);
};