import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../config';
import { getServices, type Service } from '../services/api';
import {
  Github,
  MessageCircle,
  Mail,
  CheckCircle,
  AlertCircle,
  Plus,
  Zap,
  Link2,
  Unlink,
  Music,
  Cloud,
  Clock,
  Box,
} from 'lucide-react';

import discordLogo from '../assets/logo-discord.png';
import spotifyLogo from '../assets/logo-spotify.png';
import googleLogo from '../assets/logo-google.png';
import githubLogo from '../assets/logo-github.png';

interface ConnectedService {
  provider: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  connectedAt: Date;
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const servicesData = await getServices();

      const uniqueServices = servicesData.reduce((acc: Service[], current: Service) => {
        const name = current.name.toLowerCase();
        const googleSubServices = ['gmail', 'youtube', 'google', 'google_calendar'];

        if (googleSubServices.includes(name)) {
          if (!acc.some((s) => s.name === 'Google')) {
            acc.push({ ...current, name: 'Google' });
          }
        } else {
          acc.push(current);
        }
        return acc;
      }, []);

      setAvailableServices(uniqueServices);

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
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const service = params.get('service');
    const connected = params.get('connected');
    const errorParam = params.get('error');

    if (token) {
      localStorage.setItem('token', token);
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

    loadData();
  }, [loadData]);

  const handleConnect = (serviceName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let authEndpoint = serviceName.toLowerCase();
    if (authEndpoint === 'google') {
      authEndpoint = 'gmail';
    }

    const authUrl = `${API_URL}/api/auth/${authEndpoint}`;

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

      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const getProviderName = (serviceId: string): string => {
    const mapping: Record<string, string> = {
      gmail: 'GOOGLE',
      google: 'GOOGLE',
      youtube: 'GOOGLE',
      github: 'GITHUB',
      discord: 'DISCORD',
      spotify: 'SPOTIFY',
    };
    return mapping[serviceId.toLowerCase()] || serviceId.toUpperCase();
  };

  const isServiceConnected = (serviceId: string) => {
    const providerName = getProviderName(serviceId);
    return connectedServices.some((s) => s.provider === providerName);
  };

  const getConnectedService = (serviceId: string) => {
    const providerName = getProviderName(serviceId);
    return connectedServices.find((s) => s.provider === providerName);
  };

  const isNativeService = (name: string) => {
    const n = name.toLowerCase();
    return (
      n.includes('timer') || n.includes('time') || n.includes('weather') || n.includes('meteo')
    );
  };

  const getServiceConfig = (name: string) => {
    const n = name.toLowerCase();

    if (n.includes('github'))
      return {
        icon: Github,
        logo: githubLogo,
        color: 'from-gray-700 to-gray-900',
        bgColor: 'bg-gray-800',
        description: 'Automatisez vos workflows de développement',
      };
    if (n.includes('discord'))
      return {
        icon: MessageCircle,
        logo: discordLogo,
        color: 'from-indigo-500 to-purple-600',
        bgColor: 'bg-indigo-600',
        description: 'Gérez votre communauté Discord',
      };
    if (n.includes('google') || n.includes('gmail') || n.includes('youtube'))
      return {
        icon: Mail,
        logo: googleLogo,
        color: 'from-red-500 to-yellow-500',
        bgColor: 'bg-white',
        description: 'Gmail, YouTube et services Google',
      };
    if (n.includes('spotify'))
      return {
        icon: Music,
        logo: spotifyLogo,
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-500',
        description: 'Contrôlez votre musique',
      };
    if (n.includes('weather') || n.includes('meteo'))
      return {
        icon: Cloud,
        logo: null,
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-500',
        description: 'Réagissez aux conditions météo',
      };
    if (n.includes('timer') || n.includes('clock') || n.includes('time'))
      return {
        icon: Clock,
        logo: null,
        color: 'from-gray-500 to-gray-700',
        bgColor: 'bg-gray-600',
        description: 'Déclencheurs temporels et planifiés',
      };

    return {
      icon: Box,
      logo: null,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      description: `Intégration avec ${name}`,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-20">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-dark py-8 relative overflow-hidden">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {availableServices.map((service, index) => {
                  const config = getServiceConfig(service.name);
                  const Icon = config.icon;
                  const isNative = isNativeService(service.name);
                  const isConnected = isNative || isServiceConnected(service.name);
                  const connectedInfo = getConnectedService(service.name);

                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                        isConnected
                          ? isNative
                            ? 'border-gray-200'
                            : 'border-green-300'
                          : 'border-transparent hover:border-primary/30'
                      }`}
                    >
                      {isConnected && (
                        <div className="absolute top-4 right-4 z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                              isNative ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isNative ? 'Natif' : 'Connecté'}
                          </motion.div>
                        </div>
                      )}

                      <div className={`h-24 bg-gradient-to-r ${config.color} relative`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                          <div
                            className={`w-16 h-16 ${config.bgColor} rounded-xl shadow-lg flex items-center justify-center overflow-hidden`}
                          >
                            {config.logo ? (
                              <img
                                src={config.logo}
                                alt={service.name}
                                className="w-full h-full object-cover p-2"
                              />
                            ) : (
                              <Icon className="w-8 h-8 text-white" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-12 pb-6 px-6">
                        <h3 className="text-xl font-bold text-text mb-2 capitalize">
                          {service.name}
                        </h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-2">
                          {config.description}
                        </p>

                        {isConnected && connectedInfo && !isNative && (
                          <div className="mb-4 p-3 bg-green-50 rounded-xl text-sm border border-green-100">
                            <p className="text-green-700 font-medium truncate">
                              {connectedInfo.name || connectedInfo.email || 'Compte connecté'}
                            </p>
                          </div>
                        )}

                        {isNative && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm border border-gray-100">
                            <p className="text-gray-600 font-medium">Service toujours actif</p>
                          </div>
                        )}

                        {!isNative &&
                          (isConnected ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleDisconnect(connectedInfo?.provider || service.name)
                              }
                              className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 font-semibold border border-red-100"
                            >
                              <Unlink className="w-4 h-4" />
                              Déconnecter
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleConnect(service.name)}
                              className={`w-full px-4 py-3 bg-gradient-to-r ${config.color} text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                            >
                              <Link2 className="w-4 h-4" />
                              Connecter
                            </motion.button>
                          ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

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

              {/* Section des services connectés */}
              {connectedServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-16"
                >
                  <h2 className="text-2xl font-bold text-text mb-6 text-center">
                    Comptes connectés
                  </h2>
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {connectedServices.map((service, index) => {
                        const providerLower = service.provider.toLowerCase();
                        let logo = null;
                        let bgColor = 'bg-gray-100';
                        let providerDisplayName = service.provider;

                        if (providerLower === 'github') {
                          logo = githubLogo;
                          bgColor = 'bg-gray-900';
                          providerDisplayName = 'GitHub';
                        } else if (providerLower === 'google') {
                          logo = googleLogo;
                          bgColor = 'bg-white';
                          providerDisplayName = 'Google';
                        } else if (providerLower === 'discord') {
                          logo = discordLogo;
                          bgColor = 'bg-[#5865F2]';
                          providerDisplayName = 'Discord';
                        } else if (providerLower === 'spotify') {
                          logo = spotifyLogo;
                          bgColor = 'bg-[#1DB954]';
                          providerDisplayName = 'Spotify';
                        }

                        return (
                          <motion.div
                            key={service.provider}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center p-2 shadow-sm`}
                              >
                                {logo ? (
                                  <img
                                    src={logo}
                                    alt={providerDisplayName}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <Box className="w-6 h-6 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-text">{providerDisplayName}</p>
                                <p className="text-sm text-text/60">
                                  {service.name || service.email || 'Compte connecté'}
                                  {service.name && service.email && (
                                    <span className="text-text/40"> ({service.email})</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4" />
                                Connecté
                              </span>
                              <button
                                onClick={() => handleDisconnect(service.provider)}
                                className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                              >
                                Déconnecter
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
