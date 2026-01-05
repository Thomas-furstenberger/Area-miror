import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { login } from '../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

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

    const result = await login(email, password);

    if (result.success && result.data) {
      const token = result.data.sessionToken || result.data.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/services');
      } else {
        setError('Erreur: Aucun token reçu du serveur.');
      }
    } else {
      setError(result.error || 'Échec de la connexion');
    }

    setLoading(false);
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F1DAC4]">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-[#A69CAC]/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#161B33] mb-2">Connexion</h1>
          <p className="text-[#A69CAC]">Connectez-vous à votre compte AREA</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#474973] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@email.com"
              className="w-full p-3 border border-[#A69CAC] rounded-lg focus:ring-2 focus:ring-[#474973] focus:border-[#474973] outline-none text-[#161B33]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#474973] mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-3 border border-[#A69CAC] rounded-lg focus:ring-2 focus:ring-[#474973] focus:border-[#474973] outline-none text-[#161B33]"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded flex items-center border border-red-200 text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#474973] text-white font-bold p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Se connecter'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 text-sm text-[#A69CAC]">Ou continuer avec</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('gmail')}
            className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>🔐</span> Google
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            className="w-full p-3 bg-[#24292e] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
          >
            <span>🐙</span> GitHub
          </button>

          <button
            onClick={() => handleOAuthLogin('discord')}
            className="w-full p-3 bg-[#5865f2] text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2"
          >
            <span>💬</span> Discord
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#161B33] text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-bold text-[#474973] hover:underline">
              S'inscrire
            </Link>
          </p>
          <Link to="/" className="block mt-4 text-sm text-[#A69CAC] hover:text-[#474973]">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
