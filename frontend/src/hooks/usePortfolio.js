// src/hooks/usePortfolio.js
import { useState, useCallback } from 'react';
import portfolioService from '../services/portfolioService';

const usePortfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolioItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await portfolioService.getAllItems();
      setPortfolioItems(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch portfolio items');
      console.error('Error fetching portfolio items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolioItem = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await portfolioService.getItemById(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch portfolio item');
      console.error('Error fetching portfolio item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await portfolioService.createItem(itemData);
      setPortfolioItems(prevItems => [...prevItems, data]);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to add portfolio item');
      console.error('Error adding portfolio item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioItem = async (id, itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await portfolioService.updateItem(id, itemData);
      setPortfolioItems(prevItems => 
        prevItems.map(item => item._id === id ? data : item)
      );
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update portfolio item');
      console.error('Error updating portfolio item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolioItem = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await portfolioService.deleteItem(id);
      setPortfolioItems(prevItems => 
        prevItems.filter(item => item._id !== id)
      );
    } catch (err) {
      setError(err.message || 'Failed to delete portfolio item');
      console.error('Error deleting portfolio item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    portfolioItems,
    loading,
    error,
    fetchPortfolioItems,
    fetchPortfolioItem,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
  };
};

export default usePortfolio;