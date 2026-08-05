import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loadUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/signin?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      authAPI.getMe()
        .then(({ data }) => {
          login(token, data.user);
          navigate('/dashboard', { replace: true });
        })
        .catch(() => {
          loadUser();
          navigate('/dashboard', { replace: true });
        });
    } else {
      navigate('/signin', { replace: true });
    }
  }, [searchParams, navigate, login, loadUser]);

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Completing UAE PASS authentication...</p>
    </div>
  );
}
