import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.sessionToken || data.accessToken);

      // Redirect to services page
      navigate('/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#F1DAC4',
      }}
    >
      <div
        style={{
          maxWidth: '450px',
          width: '100%',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#161B33' }}
          >
            Login
          </h1>
          <p style={{ color: '#A69CAC' }}>Sign in to your AREA account</p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#161B33',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #A69CAC',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#474973')}
              onBlur={(e) => (e.target.style.borderColor = '#A69CAC')}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#161B33',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #A69CAC',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#474973')}
              onBlur={(e) => (e.target.style.borderColor = '#A69CAC')}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#474973',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <span style={{ padding: '0 16px', color: '#A69CAC', fontSize: '14px' }}>
            Or continue with
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span>🔐</span> Google
          </button>

          <button
            onClick={handleGithubLogin}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#24292e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span>🐙</span> GitHub
          </button>

          <button
            onClick={handleDiscordLogin}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#5865f2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <span>💬</span> Discord
          </button>
        </div>

        {/* Register Link */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#A69CAC', fontSize: '14px', marginBottom: '8px' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#474973', textDecoration: 'none', fontWeight: '600' }}
            >
              Sign up
            </Link>
          </p>
          <Link to="/" style={{ color: '#474973', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
