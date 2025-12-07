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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F1DAC4]">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-[#A69CAC]/30">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#F1DAC4] rounded-full">
              <LogIn size={32} className="text-[#474973]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#474973]">Connexion</h1>
          <p className="text-[#A69CAC] mt-2 font-medium">Bon retour parmi nous</p>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center border border-red-200">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center p-2 border border-[#A69CAC] rounded text-[#161B33] hover:bg-gray-50 transition-colors"
          >
            <Github size={20} className="mr-2" /> GitHub
          </button>
          <button
            onClick={() => handleOAuthLogin('discord')}
            className="flex items-center justify-center p-2 border border-[#A69CAC] rounded bg-[#5865F2] text-white hover:opacity-90 transition-opacity"
          >
            Discord
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#A69CAC]/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#A69CAC]">Ou avec email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#474973] mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#A69CAC]" size={20} />
              <input
                type="email"
                required
                placeholder="exemple@email.com"
                className="w-full pl-10 p-3 border border-[#A69CAC] rounded-lg focus:ring-2 focus:ring-[#474973] focus:border-[#474973] outline-none text-[#161B33]"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#474973] mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#A69CAC]" size={20} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 p-3 border border-[#A69CAC] rounded-lg focus:ring-2 focus:ring-[#474973] focus:border-[#474973] outline-none text-[#161B33]"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#474973] text-white font-bold p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#161B33]">
            Pas de compte ?{' '}
            <Link to="/register" className="font-bold text-[#474973] hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
