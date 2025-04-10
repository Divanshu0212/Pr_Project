// src/services/portfolioService.js
import axios from 'axios';
import { mockPortfolioItems } from '../utils/data/portfolio-mock';

const API_URL = '/api/portfolio';
const USE_MOCK = true; // Set to false when backend is ready

// Helper function to handle file uploads
const createFormData = (itemData) => {
  const formData = new FormData();

  // Add all non-file fields
  Object.keys(itemData).forEach(key => {
    if (key !== 'image' && key !== 'technologies') {
      formData.append(key, itemData[key]);
    }
  });

  // Handle technologies array
  if (itemData.technologies && Array.isArray(itemData.technologies)) {
    formData.append('technologies', JSON.stringify(itemData.technologies));
  }

  // Add image file if it exists
  if (itemData.image instanceof File) {
    formData.append('image', itemData.image);
  }

  return formData;
};

// Mock implementation
const mockService = {
  getAllItems: () => {
    return Promise.resolve([...mockPortfolioItems]);
  },

  getItemById: (id) => {
    const item = mockPortfolioItems.find(item => item._id === id);
    if (item) {
      return Promise.resolve({...item});
    }
    return Promise.reject(new Error('Item not found'));
  },

  createItem: (itemData) => {
    const newItem = {
      _id: String(Date.now()),
      ...itemData,
      createdAt: new Date().toISOString()
    };
    mockPortfolioItems.push(newItem);
    return Promise.resolve(newItem);
  },

  updateItem: (id, itemData) => {
    const index = mockPortfolioItems.findIndex(item => item._id === id);
    if (index !== -1) {
      const updatedItem = {
        ...mockPortfolioItems[index],
        ...itemData,
        updatedAt: new Date().toISOString()
      };
      mockPortfolioItems[index] = updatedItem;
      return Promise.resolve(updatedItem);
    }
    return Promise.reject(new Error('Item not found'));
  },

  deleteItem: (id) => {
    const index = mockPortfolioItems.findIndex(item => item._id === id);
    if (index !== -1) {
      mockPortfolioItems.splice(index, 1);
      return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error('Item not found'));
  }
};

// Real API implementation
const apiService = {
  getAllItems: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      throw error;
    }
  },

  getItemById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching portfolio item with ID ${id}:`, error);
      throw error;
    }
  },

  createItem: async (itemData) => {
    try {
      const formData = createFormData(itemData);

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw error;
    }
  },

  updateItem: async (id, itemData) => {
    try {
      const formData = createFormData(itemData);

      const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error updating portfolio item with ID ${id}:`, error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting portfolio item with ID ${id}:`, error);
      throw error;
    }
  }
};

// Export the appropriate service based on the USE_MOCK flag
const portfolioService = USE_MOCK ? mockService : apiService;

export default portfolioService;
