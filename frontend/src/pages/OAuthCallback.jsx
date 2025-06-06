import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (token && userId) {
      const processAuth = async () => {
        try {
          const success = await handleOAuthCallback(token, userId);
          if (success) {
            navigate('/home'); // Or your desired post-login route
          } else {
            navigate('/login?error=oauth-failed');
          }
        } catch (err) {
          console.error('OAuth processing error:', err);
          setError(err.message);
          navigate('/login?error=oauth-error');
        }
      };
      processAuth();
    } else {
      console.error('Missing token or userId in callback');
      navigate('/login?error=invalid-callback');
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  if (error) {
    return (
      <div className="error-message">
        Authentication failed: {error}
      </div>
    );
  }

  return (
    <div className="loading-message">
      Processing authentication...
    </div>
  );
};

export default OAuthCallback;