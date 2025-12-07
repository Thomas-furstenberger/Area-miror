import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('user_token', token);
      console.log('Token saved:', token);

      setTimeout(() => {
        navigate('/areas');
      }, 1000);
    } else {
      console.error('No token received');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
          Login Successful!
        </h1>
        <p style={{ color: '#6b7280' }}>Redirecting to your AREAs...</p>
      </div>
    </div>
  );
}
