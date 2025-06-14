// src/hooks/usePortfolio.js
import { useState, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SummaryApi from '../config';
import axios from 'axios';

const usePortfolio = () => {
  const { currentUser } = useContext(AuthContext);
  const [portfolioData, setPortfolioData] = useState({
    portfolioDetails: null,
    skills: [],
    projects: [],
    certificates: [],
    experiences: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Check if user is authenticated before making requests
  const checkAuth = () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
  };

  // Fetch all portfolio data at once
  const fetchAllPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      checkAuth();
      const headers = getAuthHeaders();
      
      // Make all requests in parallel with auth headers
      const requests = [
        axios.get(SummaryApi.portfolioDetails.get.url, { headers }),
        axios.get(SummaryApi.skills.get.url, { headers }),
        axios.get(SummaryApi.projects.get.url, { headers }),
        axios.get(SummaryApi.certificates.get.url, { headers }),
        axios.get(SummaryApi.experiences.get.url, { headers }),
      ];

      const responses = await Promise.all(requests);
      
      setPortfolioData({
        portfolioDetails: responses[0].data?.data || null,
        skills: responses[1].data || [],
        projects: responses[2].data?.projects || [],
        certificates: responses[3].data?.certificates || [],
        experiences: responses[4].data?.experiences || []
      });

      return {
        portfolioDetails: responses[0].data?.data || null,
        skills: responses[1].data || [],
        projects: responses[2].data?.projects || [],
        certificates: responses[3].data?.certificates || [],
        experiences: responses[4].data?.experiences || [],
      };

    } catch (err) {
      setError(err.message || 'Failed to fetch portfolio data');
      console.error('Fetch all error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
  

  return {
    portfolioData,
    loading,
    error,
    fetchAllPortfolioData
  };
};

export default usePortfolio;