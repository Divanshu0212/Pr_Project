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

  const [portfolioDetails, setPortfolioDetails] = useState({
    jobTitle: '',
    location: '',
    phone: '',
    yearsOfExperience: 0,
    availability: 'available',
    bio: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: ''
    }
  });

  const token = localStorage.getItem('token');
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          console.log('User data fetched successfully:', userData);
          setCurrentUser({
            id:userData.user.id,
            username: userData.user.username || 'User',
            displayName: userData.user.displayName || userData.user.name || 'User',
            email: userData.user.email,
            profileImage: userData.user.profileImage || null
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
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

      const response = await fetch(SummaryApi.current_user.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({
          ...userData.data,
          displayName: userData.data.displayName || 'User',
          profileImage: userData.data.profileImage || null
        });
        setIsAuthenticated(true);
      } else {
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

  const fetchPortfolioDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SummaryApi.portfolioDetails.get.url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setPortfolioDetails(data.data);
          return data.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching portfolio details:', error);
      return null;
    }
  };

  const updatePortfolioDetails = async (updatedDetails) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(SummaryApi.portfolioDetails.update.url, {
        method: SummaryApi.portfolioDetails.update.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedDetails)
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioDetails(data.data);
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating portfolio details:', error);
      return null;
    }
  };


  useEffect(() => {
    fetchUserDetails();
    fetchPortfolioDetails();
  }, []);
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


      if (response.ok) {
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

  const signup = async (email, password, username, displayName) => {
    setError(null);
    try {
      const response = await fetch(SummaryApi.signUp.url, {
        method: SummaryApi.signUp.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password, displayName }),
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

  const logout = async () => {
    try {
      await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include',
      });

      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
    }
  };

  const signInWithGoogle = () => {
    window.open(SummaryApi.googleAuth.url || "http://localhost:5000/api/auth/google", "_self");
  };

  const signInWithGithub = () => {
    window.open(SummaryApi.githubAuth.url || "http://localhost:5000/api/auth/github", "_self");
  };
  const handleOAuthCallback = async (token, user) => {
    try {
      if (token && user) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', token);

        setCurrentUser({
          id: user._id,
          username: user.username || 'User',
          displayName: user.displayName || 'User',
          email: user.email,
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
    portfolioDetails,
    setCurrentUser,
    setIsAuthenticated,
    login,
    signup,
    logout,
    signInWithGoogle,
    signInWithGithub,
    handleOAuthCallback,
    refreshUserDetails: fetchUserDetails,
    fetchUserDetails,
    fetchPortfolioDetails,
    updatePortfolioDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};