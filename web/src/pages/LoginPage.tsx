import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Github } from 'lucide-react';
import { login } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      localStorage.setItem('accessToken', result.data.accessToken);
      if (result.data.sessionToken) {
        localStorage.setItem('sessionToken', result.data.sessionToken);
      }
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleOAuthLogin = (provider: 'github' | 'discord') => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Connexion</h1>

        {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center p-2 border rounded hover:bg-gray-50"
          >
            <Github size={20} className="mr-2" /> GitHub
          </button>
          <button
            onClick={() => handleOAuthLogin('discord')}
            className="flex items-center justify-center p-2 border rounded bg-[#5865F2] text-white hover:bg-[#4752C4]"
          >
            Discord
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border rounded-lg"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Se connecter'}
          </button>
        </form>
        <Link to="/register" className="block text-center mt-4 text-blue-600">
          Pas de compte ?
        </Link>
      </div>
    </div>
  );
}
