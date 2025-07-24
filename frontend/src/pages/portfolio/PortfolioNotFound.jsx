import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const PortfolioNotFound = () => {
  const { state } = useLocation();
  const { isDark } = useTheme();
  const username = state?.username || 'unknown';

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`text-center p-8 rounded-lg shadow-lg max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-4">Portfolio Not Found</h2>
        <p className="mb-6">
          The portfolio for <span className="font-semibold">@{username}</span> could not be found.
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/"
            className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            Go to Homepage
          </Link>
          <Link
            to="/search"
            className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Search for Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortfolioNotFound;