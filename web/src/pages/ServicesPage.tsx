import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Github, MessageCircle, Mail, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

interface ConnectedService {
  provider: string;
  email?: string;
  username?: string;
  connectedAt: Date;
}

const SERVICES = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'bg-gray-800 hover:bg-gray-900',
    description: 'Connectez votre compte GitHub pour automatiser vos workflows',
    authUrl: 'http://localhost:3000/api/auth/github',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageCircle,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    description: 'Connectez Discord pour recevoir des notifications',
    authUrl: 'http://localhost:3000/api/auth/discord',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Connectez Gmail pour gérer vos emails automatiquement',
    authUrl: 'http://localhost:3000/api/auth/gmail',
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
  }, []);

  const fetchConnectedServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/oauth-accounts', {
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

    // Redirect to OAuth with token as query param
    // The backend will pass it as state to OAuth provider
    window.location.href = `${authUrl}?token=${encodeURIComponent(token)}`;
  };

  const handleDisconnect = async (provider: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/user/oauth/${provider}`, {
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
      gmail: 'GOOGLE',
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text mb-4">Connectez vos services</h1>
          <p className="text-lg text-secondary">
            Connectez vos comptes pour créer des automatisations puissantes
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-secondary">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                const isConnected = isServiceConnected(service.id);
                const connectedInfo = getConnectedService(service.id);

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-primary transition-all duration-200"
                  >
                    {/* Service Icon & Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`${service.color} p-3 rounded-lg text-white transition-colors duration-200`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-text">{service.name}</h3>
                        {isConnected && (
                          <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Connecté</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-secondary text-sm mb-4">{service.description}</p>

                    {/* Connected Info */}
                    {isConnected && connectedInfo && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
                        <p className="text-gray-700">
                          {connectedInfo.email || connectedInfo.username || 'Compte connecté'}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(connectedInfo?.provider || service.id)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnecter
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(service.authUrl)}
                        className={`w-full px-4 py-2 ${service.color} text-white rounded-lg transition-colors duration-200 font-medium`}
                      >
                        Connecter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connected Services Summary */}
            {connectedServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-12">
                <h2 className="text-2xl font-bold text-text mb-4">Services connectés</h2>
                <div className="space-y-3">
                  {connectedServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-text">{service.provider}</p>
                          {service.email && (
                            <p className="text-sm text-secondary">{service.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(service.provider)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Déconnecter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/areas/create')}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 font-medium text-lg shadow-md"
              >
                Créer une AREA
              </button>
              <button
                onClick={() => navigate('/areas')}
                className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 font-medium text-lg"
              >
                Voir mes AREAs
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
