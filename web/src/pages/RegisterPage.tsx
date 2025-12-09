import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { register } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await register(formData.email, formData.password, formData.name);
    setIsLoading(false);

    if (result.success) {
      // Store token if provided
      const data = result.data as { accessToken?: string; sessionToken?: string };
      if (data?.accessToken || data?.sessionToken) {
        localStorage.setItem('token', data.sessionToken || data.accessToken || '');
        navigate('/services');
      } else {
        navigate('/login', { state: { message: 'Compte créé ! Connecte-toi.' } });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F1DAC4]">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl border border-[#A69CAC]/30">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#F1DAC4] rounded-full">
              <UserPlus size={32} className="text-[#474973]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#474973]">Inscription</h1>
          <p className="text-[#A69CAC] mt-2 font-medium">Rejoins l'aventure AREA</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center border border-red-200">
            <AlertCircle size={20} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#474973] mb-1">Nom</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-[#A69CAC]" size={20} />
              <input
                type="text"
                required
                placeholder="Ton Nom"
                className="w-full pl-10 p-3 border border-[#A69CAC] rounded-lg focus:ring-2 focus:ring-[#474973] focus:border-[#474973] outline-none text-[#161B33]"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

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
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#161B33]">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-[#474973] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
