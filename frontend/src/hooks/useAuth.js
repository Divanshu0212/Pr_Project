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
      try {
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
      } catch (error) {
        throw error;
      }
    }
  };

  return enhancedContext;
};