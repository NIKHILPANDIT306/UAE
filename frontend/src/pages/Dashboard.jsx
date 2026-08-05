import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await authAPI.uaePassLogout();
      await logout();
      if (user?.authProvider === 'uaepass' && data.logoutUrl) {
        window.location.href = data.logoutUrl;
      } else {
        navigate('/signin');
      }
    } catch {
      await logout();
      navigate('/signin');
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>UAE Pass Portal</h1>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>
            Welcome, {user?.firstName || user?.email}!
          </h2>
          <p className="subtitle">You are successfully authenticated.</p>
        </div>

        <div className="profile-card">
          <h3>Profile Information</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">Email</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="profile-item">
              <span className="label">First Name</span>
              <span className="value">{user?.firstName || '—'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Last Name</span>
              <span className="value">{user?.lastName || '—'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Phone</span>
              <span className="value">{user?.phone || '—'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Emirates ID</span>
              <span className="value">{user?.emiratesId || '—'}</span>
            </div>
            <div className="profile-item">
              <span className="label">Auth Provider</span>
              <span className="value badge">{user?.authProvider}</span>
            </div>
            <div className="profile-item">
              <span className="label">Verified</span>
              <span className="value">{user?.isVerified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
