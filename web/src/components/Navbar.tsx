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

  return (
    <nav className="bg-background border-b border-secondary/20 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:opacity-80">
            AREA
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Tableau de bord
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!loading &&
              (user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="text-blue-600" size={20} />
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Inscription
                  </Link>
                </>
              ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <Link to="/" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              Accueil
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <LayoutDashboard size={18} className="mr-2" /> Tableau de bord
                </Link>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <div className="flex items-center px-4 py-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} className="h-8 w-8 rounded-full" />
                      ) : (
                        <UserIcon size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
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
                  className="text-center py-2 text-blue-600 font-medium border border-blue-200 rounded-lg"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm"
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
