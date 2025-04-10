// src/context/ThemeContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the Theme Context
const ThemeContext = createContext();

// Create a Theme Provider component
export const ThemeProvider = ({ children }) => {
  // Get initial theme from local storage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('appTheme');
    return storedTheme ? storedTheme : 'light';
  });

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Update local storage whenever the theme changes
  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    // You might also want to apply the theme to the document body here
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Prop types for ThemeProvider
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Create a custom hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};