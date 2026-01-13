import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../config';
import {
  Github,
  MessageCircle,
  Globe,
  CheckCircle,
  AlertCircle,
  Plus,
  Zap,
  Link2,
  Unlink,
} from 'lucide-react';

interface ConnectedService {
  provider: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  connectedAt: Date;
}

const SERVICES = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-800',
    description: 'Connectez votre compte GitHub pour automatiser vos workflows de développement',
    authUrl: `${API_URL}/api/auth/github`,
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-600',
    description: 'Connectez Discord pour recevoir des notifications et automatiser vos serveurs',
    authUrl: `${API_URL}/api/auth/discord`,
  },
  {
    id: 'google',
    name: 'Google',
    icon: Globe,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500',
    description: 'Connectez Google pour gérer vos emails et accéder à vos services',
    authUrl: `${API_URL}/api/auth/gmail`,
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in URL (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const service = params.get('service');
    const connected = params.get('connected');
    const errorParam = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
      // Clean URL
      window.history.replaceState({}, '', '/services');

      if (errorParam) {
        const errorMsg = decodeURIComponent(errorParam);
        if (errorMsg.includes('already connected')) {
          setError('Ce compte est déjà connecté à un autre utilisateur');
        } else {
          setError(`Erreur lors de la connexion: ${errorMsg}`);
        }
        setTimeout(() => setError(null), 8000);
      } else if (connected && service) {
        setSuccessMessage(`${service.toUpperCase()} connecté avec succès !`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }

    fetchConnectedServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConnectedServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/oauth-accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer les services connectés');
      }

      const data = await response.json();
      setConnectedServices(data.accounts || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (authUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Pass state as JSON with token and redirect URL
    const state = JSON.stringify({
      userToken: token,
      redirect: `${window.location.origin}/services`,
    });
    window.location.href = `${authUrl}?state=${encodeURIComponent(state)}`;
  };

  const handleDisconnect = async (provider: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/oauth/${provider}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de déconnecter le service');
      }

      // Refresh the list
      fetchConnectedServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Map frontend service IDs to backend provider names
  const getProviderName = (serviceId: string): string => {
    const mapping: Record<string, string> = {
      google: 'GOOGLE',
      github: 'GITHUB',
      discord: 'DISCORD',
    };
    return mapping[serviceId] || serviceId.toUpperCase();
  };

  const isServiceConnected = (serviceId: string) => {
    const providerName = getProviderName(serviceId);
    return connectedServices.some((s) => s.provider === providerName);
  };

  const getConnectedService = (serviceId: string) => {
    const providerName = getProviderName(serviceId);
    return connectedServices.find((s) => s.provider === providerName);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-dark py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="inline-flex p-4 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm"
              >
                <Link2 className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Connectez vos services
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Liez vos applications préférées pour débloquer des automatisations puissantes
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="font-medium">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="p-1 bg-red-100 rounded-full">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
              />
              <p className="mt-4 text-secondary font-medium">Chargement de vos services...</p>
            </div>
          ) : (
            <>
              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {SERVICES.map((service, index) => {
                  const Icon = service.icon;
                  const isConnected = isServiceConnected(service.id);
                  const connectedInfo = getConnectedService(service.id);

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                        isConnected
                          ? 'border-green-300'
                          : 'border-transparent hover:border-primary/30'
                      }`}
                    >
                      {/* Connected badge */}
                      {isConnected && (
                        <div className="absolute top-4 right-4 z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Connecté
                          </motion.div>
                        </div>
                      )}

                      {/* Gradient header */}
                      <div className={`h-24 bg-gradient-to-r ${service.color} relative`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                          <div
                            className={`w-16 h-16 ${service.bgColor} rounded-xl shadow-lg flex items-center justify-center`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-12 pb-6 px-6">
                        <h3 className="text-xl font-bold text-text mb-2">{service.name}</h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        {/* Connected Info */}
                        {isConnected && connectedInfo && (
                          <div className="mb-4 p-3 bg-green-50 rounded-xl text-sm border border-green-100">
                            <p className="text-green-700 font-medium truncate">
                              {connectedInfo.name || connectedInfo.email || 'Compte connecté'}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        {isConnected ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDisconnect(connectedInfo?.provider || service.id)}
                            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 font-semibold border border-red-100"
                          >
                            <Unlink className="w-4 h-4" />
                            Déconnecter
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleConnect(service.authUrl)}
                            className={`w-full px-4 py-3 bg-gradient-to-r ${service.color} text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                          >
                            <Link2 className="w-4 h-4" />
                            Connecter
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/areas/create')}
                  className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer une AREA
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/areas')}
                  className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Voir mes AREAs
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
