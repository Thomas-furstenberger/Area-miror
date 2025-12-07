import { Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/gmail`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const handleDiscordLogin = () => {
    window.location.href = `${API_URL}/api/auth/discord`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Login</h1>
          <p style={{ color: '#6b7280' }}>Sign in to your AREA account</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span>🔐</span> Sign in with Google
          </button>

          <button
            onClick={handleGithubLogin}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#24292e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span>🐙</span> Sign in with GitHub
          </button>

          <button
            onClick={handleDiscordLogin}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#5865f2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <span>💬</span> Sign in with Discord
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
