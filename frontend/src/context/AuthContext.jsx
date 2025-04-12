import React, { createContext, useState, useEffect } from 'react';
import SummaryApi from '../config';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const token = localStorage.getItem('token');



  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response)
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({
            displayName: userData.username || userData.name || 'User',
            email: userData.email
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);



  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is invalid or expired
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
    } finally {
      setLoading(false);
    }
  };

  // In your AuthContext or main App component
  // Check auth status on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Regular email/password login
  // In your login function in AuthContext.jsx:
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("Login response:", result); // Debug response

      if (response.ok) {
        // Make sure you're extracting the token correctly based on your API response
        const token = result.data?.token || result.data;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("isAuthenticated", "true");
          setIsAuthenticated(true);
          await fetchUserDetails();
          return result;
        } else {
          console.error("No token received from login");
          setError("Authentication failed - no token received");
          throw new Error("No token received");
        }
      } else {
        setError(result.message || "Login failed.");
        throw new Error(result.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred. Please try again.");
      throw error;
    }
  };

  // Regular email/password signup
  const signup = async (email, password, username) => {
    setError(null);
    try {
      const response = await fetch(SummaryApi.signUp.url, {
        method: SummaryApi.signUp.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        return result;
      } else {
        setError(result.message || 'Signup failed.');
        throw new Error(result.message || 'Signup failed.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred. Please try again.');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include',
      });

      // Clear auth state regardless of server response
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear auth state even if server request fails
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
    }
  };

  // Google OAuth login
  const signInWithGoogle = () => {
    window.open(SummaryApi.googleAuth.url || "http://localhost:5000/auth/google", "_self");
  };

  // GitHub OAuth login
  const signInWithGithub = () => {
    window.open(SummaryApi.githubAuth.url || "http://localhost:5000/auth/github", "_self");
  };

  // OAuth callback handler
  // In your AuthContext.js
const handleOAuthCallback = async (token, userId) => {
  try {
    // Verify the token first
    const response = await fetch(`http://localhost:5000/api/auth/verify-token`, {
      method:'GET',
      credentials:'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response)

    if (response.ok) {
      const userData = await response.json();
      
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      setCurrentUser({
        id: userData._id,
        displayName: userData.username || userData.displayName || 'User',
        email: userData.email,
      });
      
      setIsAuthenticated(true);
      await fetchUserDetails(); 
      return true;
    } else {
      throw new Error('Token verification failed');
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    logout(); // Clear any existing auth state
    return false;
  }
};

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    setCurrentUser,
    setIsAuthenticated,
    login,
    signup,
    logout,
    signInWithGoogle,
    signInWithGithub,
    handleOAuthCallback,
    refreshUserDetails: fetchUserDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Define propTypes for AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};