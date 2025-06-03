import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import SummaryApi from '../config';

// Custom hook to use auth context throughout the app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const enhancedContext = {
    ...context,

    // Enhanced signup method that includes profile image
    signup: async (email, password, username, profileImageFile) => {
      try {
        // First register the user
        const response = await axios.post(SummaryApi.signUp.url, {
          username,
          email,
          password
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // if (profileImageFile) {
        //   const formData = new FormData();
        //   formData.append('profileImage', profileImageFile);

        //   const uploadResponse = await fetch(SummaryApi.profileImage.url, {
        //     method: SummaryApi.profileImage.method,
        //     headers: {
        //       'Authorization': `Bearer ${response.data.token}`
        //     },
        //     body: formData
        //   });
        //   const uploadResult = await uploadResponse.json();

        //   if (!uploadResponse.ok) {
        //     throw new Error(uploadResult.message || 'Image upload failed');
        //   }

        //   console.log('Image upload result:', uploadResult); // Debug log
        // }

        // Login the user after successful signup
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        context.setIsAuthenticated(true);
        if (typeof context.fetchUserDetails === 'function') {
          await context.fetchUserDetails();
        } else {
          // Fallback: manually set user data if fetch isn't available
          context.setCurrentUser?.({
            id: response.data.user._id,
            username: response.data.user.username,
            email: response.data.user.email
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