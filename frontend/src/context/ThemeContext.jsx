import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Theme constants
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

const STORAGE_KEY = 'app-theme-preference';
const TRANSITION_DURATION = 300;

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for system theme detection
const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return THEMES.LIGHT;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};

// Utility functions
const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
    return null;
  }
};

const setStoredTheme = (theme) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

const getInitialTheme = () => {
  const stored = getStoredTheme();
  if (stored && Object.values(THEMES).includes(stored)) {
    return stored;
  }
  return THEMES.SYSTEM;
};

export const ThemeProvider = ({ children, defaultTheme = THEMES.SYSTEM }) => {
  const [themePreference, setThemePreference] = useState(() => 
    getInitialTheme() || defaultTheme
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const systemTheme = useSystemTheme();

  // Resolve actual theme (handles 'system' preference)
  const resolvedTheme = useMemo(() => {
    if (themePreference === THEMES.SYSTEM) {
      return systemTheme;
    }
    return themePreference;
  }, [themePreference, systemTheme]);

  // Hydration effect (prevents SSR mismatch)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = resolvedTheme === THEMES.DARK;
    
    // Add transition class for smooth theme change
    setIsTransitioning(true);
    
    // Apply theme class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const themeColor = isDark ? '#1a1a1a' : '#ffffff';
      themeColorMeta.setAttribute('content', themeColor);
    }

    // Save preference to localStorage
    setStoredTheme(themePreference);
    
    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
    
    return () => clearTimeout(timer);
  }, [resolvedTheme, themePreference, isHydrated]);

  // Theme manipulation functions
  const setTheme = useCallback((theme) => {
    if (Object.values(THEMES).includes(theme)) {
      setThemePreference(theme);
    } else {
      console.warn(`Invalid theme: ${theme}`);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (themePreference === THEMES.SYSTEM) {
      // If on system, toggle to opposite of current system theme
      setTheme(systemTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
    } else {
      // Toggle between light and dark
      setTheme(themePreference === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
    }
  }, [themePreference, systemTheme, setTheme]);

  const setLightTheme = useCallback(() => setTheme(THEMES.LIGHT), [setTheme]);
  const setDarkTheme = useCallback(() => setTheme(THEMES.DARK), [setTheme]);
  const setSystemTheme = useCallback(() => setTheme(THEMES.SYSTEM), [setTheme]);

  // Theme utilities
  const getThemeColor = useCallback((colorName) => {
    if (typeof window === 'undefined') return '';
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    return computedStyle.getPropertyValue(`--color-${colorName}`).trim();
  }, []);

  const getCSSVariable = useCallback((variableName) => {
    if (typeof window === 'undefined') return '';
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    return computedStyle.getPropertyValue(variableName).trim();
  }, []);

  // Computed values
  const isDark = resolvedTheme === THEMES.DARK;
  const isLight = resolvedTheme === THEMES.LIGHT;
  const isSystemPreference = themePreference === THEMES.SYSTEM;

  // Context value
  const value = useMemo(() => ({
    // Current theme state
    theme: resolvedTheme,
    themePreference,
    isDark,
    isLight,
    isSystemPreference,
    isTransitioning,
    isHydrated,
    systemTheme,

    // Theme setters
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,

    // Utilities
    getThemeColor,
    getCSSVariable,

    // Constants
    THEMES,
  }), [
    resolvedTheme,
    themePreference,
    isDark,
    isLight,
    isSystemPreference,
    isTransitioning,
    isHydrated,
    systemTheme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    getThemeColor,
    getCSSVariable,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultTheme: PropTypes.oneOf(Object.values(THEMES)),
};

// Higher-order component for theme-aware components
export const withTheme = (Component) => {
  const ThemedComponent = (props) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
};

// Hook for theme-aware styling
export const useThemeStyles = (lightStyles, darkStyles) => {
  const { isDark } = useTheme();
  return useMemo(() => (isDark ? darkStyles : lightStyles), [isDark, lightStyles, darkStyles]);
};

// Hook for conditional theme classes
export const useThemeClasses = (classes) => {
  const { isDark, isLight } = useTheme();
  
  return useMemo(() => {
    const result = [];
    
    if (classes.base) result.push(classes.base);
    if (classes.light && isLight) result.push(classes.light);
    if (classes.dark && isDark) result.push(classes.dark);
    
    return result.join(' ');
  }, [classes, isDark, isLight]);
};