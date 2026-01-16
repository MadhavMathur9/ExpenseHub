import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    
    const code = searchParams.get('code');
    const err = searchParams.get('error');

    if (err) {
      setError(err);
      return;
    }

    if (code) {
      processedRef.current = true;
      const redirectUri = window.location.origin + '/auth/callback';
      api.ssoCallback(code, redirectUri)
        .then((res) => {
          return login(res.access_token);
        })
        .then(() => {
          navigate('/');
        })
        .catch((e: any) => {
          setError(e.message || 'SSO authentication failed.');
        });
    } else {
      setError('No authorization code found.');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      {error ? (
        <div className="bg-red-50 text-negative p-6 rounded-lg shadow-sm max-w-md w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium bg-white border border-border px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-secondary text-sm font-medium">Completing sign in...</p>
        </div>
      )}
    </div>
  );
}
