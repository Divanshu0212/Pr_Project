import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import SummaryApi from '../config';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const enhancedContext = {
    ...context,

    signup: async (email, password, username, displayName, profileImageFile) => {
  
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('displayName', displayName);
        if (profileImageFile) {
          formData.append('profileImage', profileImageFile);
        }

        const response = await axios.post(SummaryApi.signUp.url, formData, {
          withCredentials: true,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        context.setIsAuthenticated(true);
        if (typeof context.fetchUserDetails === 'function') {
          await context.fetchUserDetails();
        } else {
          context.setCurrentUser?.({
            id: response.data.user._id,
            username: response.data.user.username,
            displayName: response.data.user.displayName,
            email: response.data.user.email,
            profileImage: response.data.user.profileImage
          });
        }

        return response.data;
    },

    logout: async () => {
      try {
        const response = await axios.post(SummaryApi.logout_user.url, {}, {
          withCredentials: true,
        });

        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');

        // Update auth state
        context.setIsAuthenticated(false);
        context.setCurrentUser(null);

        return response.data;
      } catch (error) {
        // Even if the API call fails, we should still clear local state
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        context.setIsAuthenticated(false);
        context.setCurrentUser(null);
        
        throw error;
      }
    }
  };

  return enhancedContext;
};