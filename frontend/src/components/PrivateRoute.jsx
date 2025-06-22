import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './common/Loader'; // Assuming you have a standard Loader component

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // While authentication status is being determined, show the polished loader
  if (loading) {
    // This provides a full-screen loader, consistent with the rest of the app
    return <Loader />;
  }
  
  // If authenticated, render the child route (via Outlet).
  // If not, redirect to the login page. This logic is preserved.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;