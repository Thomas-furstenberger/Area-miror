import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { me, logout } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const result = await me();
        if (result.success) {
          setUser(result.data);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('sessionToken');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  // Couleurs de la charte
  const colors = {
    bg: 'bg-[#F1DAC4]',
    text: 'text-[#474973]',
    border: 'border-[#A69CAC]',
    hover: 'hover:opacity-80',
    buttonBg: 'bg-[#474973]',
    buttonText: 'text-white',
  };

  return (
    <nav className={`${colors.bg} border-b ${colors.border} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className={`text-2xl font-bold ${colors.text} ${colors.hover}`}>
            AREA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`${colors.text} font-medium ${colors.hover} transition-opacity`}
            >
              Accueil
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`${colors.text} font-medium ${colors.hover} transition-opacity`}
              >
                Tableau de bord
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons / User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {!loading &&
              (user ? (
                // MODE CONNECTÉ
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 pl-4 border-l ${colors.border}`}>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-semibold ${colors.text}`}>{user.name}</span>
                      <span className="text-xs text-[#161B33]">{user.email}</span>
                    </div>
                    {/* Avatar */}
                    <div
                      className={`h-10 w-10 rounded-full bg-white flex items-center justify-center overflow-hidden border ${colors.border}`}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className={colors.text} size={20} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className={`p-2 ${colors.text} hover:text-red-500 transition-colors`}
                    title="Se déconnecter"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                // MODE VISITEUR
                <>
                  <Link
                    to="/login"
                    className={`px-6 py-2 ${colors.text} font-bold border-2 border-[#474973] rounded-lg hover:bg-[#474973] hover:text-white transition-all`}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className={`px-6 py-2 ${colors.buttonBg} ${colors.buttonText} rounded-lg ${colors.hover} transition-opacity font-bold shadow-md`}
                  >
                    Inscription
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${colors.text}`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 space-y-4 border-t ${colors.border}`}>
            <Link
              to="/"
              className={`block px-4 py-2 ${colors.text} font-medium hover:bg-white/20 rounded-lg`}
            >
              Accueil
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center px-4 py-2 ${colors.text} font-medium hover:bg-white/20 rounded-lg`}
                >
                  <LayoutDashboard size={18} className="mr-2" /> Tableau de bord
                </Link>
                <div className={`border-t ${colors.border} my-2 pt-2`}>
                  <div className="flex items-center px-4 py-2 mb-2">
                    <div
                      className={`h-8 w-8 rounded-full bg-white flex items-center justify-center mr-3 border ${colors.border}`}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="h-8 w-8 rounded-full" />
                      ) : (
                        <UserIcon size={16} className={colors.text} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm ${colors.text}`}>{user.name}</span>
                      <span className="text-xs text-[#161B33]">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut size={18} className="mr-2" /> Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 px-4 pt-2">
                <Link
                  to="/login"
                  className={`text-center py-2 ${colors.text} font-bold border-2 border-[#474973] rounded-lg`}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className={`text-center py-2 ${colors.buttonBg} ${colors.buttonText} font-bold rounded-lg shadow-sm`}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
