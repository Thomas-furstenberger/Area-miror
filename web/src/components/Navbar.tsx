import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await me();
        if (result.success) {
          setUser(result.data);
        } else {
          localStorage.removeItem('token');
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
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-primary/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <span className="text-background font-bold text-xl">A</span>
            </motion.div>
            <span className="text-2xl font-bold text-text group-hover:text-primary transition-colors">
              AREA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { name: 'Produit', href: '/#features' },
              { name: 'Intégrations', href: '/integrations' },
              { name: 'Tarifs', href: '/pricing' },
              { name: 'Ressources', href: '/resources' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-4 py-2 text-text/80 hover:text-primary font-medium transition-colors rounded-lg hover:bg-primary/5"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons / User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {!loading &&
              (user ? (
                // MODE CONNECTÉ
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-background font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-text">{user.name}</span>
                      <span className="text-xs text-text/50">{user.email}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-text/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <Link
                          to="/areas"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 text-primary" />
                          <span className="text-text font-medium">Mes Areas</span>
                        </Link>
                        <Link
                          to="/services"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <UserIcon className="w-5 h-5 text-primary" />
                          <span className="text-text font-medium">Services</span>
                        </Link>
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 transition-colors text-red-500"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Déconnexion</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // MODE VISITEUR
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 text-text font-semibold hover:text-primary transition-colors"
                    >
                      Connexion
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(71, 73, 115, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-primary text-background rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all"
                    >
                      Démarrer gratuitement
                    </motion.button>
                  </Link>
                </>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-text rounded-lg hover:bg-primary/10 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-6 space-y-2 border-t border-primary/10">
                {[
                  { name: 'Produit', href: '/#features' },
                  { name: 'Intégrations', href: '/integrations' },
                  { name: 'Tarifs', href: '/pricing' },
                  { name: 'Ressources', href: '/resources' },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-text font-medium hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-4 border-t border-primary/10 mt-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} className="h-10 w-10 rounded-full" />
                          ) : (
                            <span className="text-background font-semibold">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text">{user.name}</p>
                          <p className="text-sm text-text/50">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/areas"
                        className="flex items-center gap-3 px-4 py-3 text-text font-medium hover:bg-primary/5 rounded-xl"
                      >
                        <LayoutDashboard size={18} /> Mes Areas
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <LogOut size={18} /> Déconnexion
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 px-4">
                      <Link to="/login">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 text-text font-semibold border-2 border-primary rounded-xl hover:bg-primary hover:text-background transition-all"
                        >
                          Connexion
                        </motion.button>
                      </Link>
                      <Link to="/register">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 bg-primary text-background font-semibold rounded-xl shadow-lg"
                        >
                          Démarrer gratuitement
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
