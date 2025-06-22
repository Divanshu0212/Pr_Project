import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsAuthenticated, setCurrentUser, fetchUserDetails } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        console.log('OAuth Callback - Token:', token ? 'Present' : 'Missing');
        console.log('OAuth Callback - Provider:', provider);
        console.log('OAuth Callback - Error:', error);

        // Handle error cases
        if (error) {
          console.error('OAuth Error:', error);
          setError(`Authentication failed: ${error}`);
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Handle missing token
        if (!token) {
          console.error('Missing token in OAuth callback');
          setError('Authentication failed: No token received');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store token
        localStorage.setItem('token', token);
        localStorage.setItem('isAuthenticated', 'true');

        // Update auth state
        setIsAuthenticated(true);

        // Fetch user details using the token
        if (typeof fetchUserDetails === 'function') {
          await fetchUserDetails();
        }

        setStatus('success');
        
        // Redirect to home after successful authentication
        setTimeout(() => {
          navigate('/home');
        }, 1500);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError('Authentication failed: ' + error.message);
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setIsAuthenticated, setCurrentUser, fetchUserDetails]);

  // Loading state
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00FFFF] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#00FFFF] mb-2">Completing Sign In...</h2>
          <p className="text-[#E5E5E5]">Please wait while we set up your account</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#00FFFF] mb-2">Sign In Successful!</h2>
          <p className="text-[#E5E5E5]">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Authentication Failed</h2>
          <p className="text-[#E5E5E5] mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#00FFFF] text-[#0D1117] px-6 py-2 rounded-lg font-medium hover:bg-[#00CCCC] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;