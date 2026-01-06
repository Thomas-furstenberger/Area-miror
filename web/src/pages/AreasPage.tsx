import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Plus,
  Zap,
  Play,
  Pause,
  Trash2,
  ArrowRight,
  Clock,
  Github,
  Mail,
  MessageCircle,
  Sparkles,
  Activity,
  MoreVertical,
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  actionService: string;
  actionType: string;
  reactionService: string;
  reactionType: string;
  createdAt: string;
}

const serviceIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  github: Github,
  discord: MessageCircle,
  timer: Clock,
};

const serviceColors: Record<string, string> = {
  gmail: 'from-red-500 to-orange-500',
  github: 'from-gray-700 to-gray-900',
  discord: 'from-indigo-500 to-purple-600',
  timer: 'from-blue-500 to-cyan-500',
};

export default function AreasPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/areas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAreas(data.areas);
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/areas/${id}/toggle`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchAreas();
      }
    } catch (error) {
      console.error('Error toggling area:', error);
    }
  };

  const deleteArea = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette AREA ?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/areas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchAreas();
      }
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const getServiceIcon = (service: string) => {
    return serviceIcons[service] || Zap;
  };

  const getServiceColor = (service: string) => {
    return serviceColors[service] || 'from-gray-500 to-gray-700';
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
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary rounded-full blur-3xl"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"
                  >
                    <Activity className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    {areas.length} AREA{areas.length !== 1 ? 's' : ''} actif
                    {areas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Mes automatisations
                </h1>
                <p className="text-xl text-white/70">
                  Gérez et surveillez vos workflows automatisés
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/areas/create')}
                className="px-6 py-4 bg-white text-primary rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-5 h-5" />
                Créer une AREA
              </motion.button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
              />
              <p className="mt-4 text-secondary font-medium">
                Chargement de vos automatisations...
              </p>
            </div>
          ) : areas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-text mb-3">Aucune automatisation</h2>
              <p className="text-secondary mb-8 max-w-md mx-auto">
                Créez votre première AREA pour commencer à automatiser vos tâches répétitives
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/areas/create')}
                className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Créer ma première AREA
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {areas.map((area, index) => {
                  const ActionIcon = getServiceIcon(area.actionService);
                  const ReactionIcon = getServiceIcon(area.reactionService);

                  return (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                        area.active ? 'border-green-200' : 'border-transparent'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          {/* Area Info */}
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-text">{area.name}</h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  area.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {area.active ? '● Actif' : '○ Inactif'}
                              </span>
                            </div>
                            {area.description && (
                              <p className="text-secondary mb-4 line-clamp-2">{area.description}</p>
                            )}

                            {/* Flow visualization */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Action */}
                              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getServiceColor(area.actionService)} flex items-center justify-center`}
                                >
                                  <ActionIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-indigo-600 font-medium">SI</p>
                                  <p className="text-sm font-semibold text-text capitalize">
                                    {area.actionService}
                                  </p>
                                </div>
                              </div>

                              <ArrowRight className="w-5 h-5 text-secondary" />

                              {/* Reaction */}
                              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl">
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getServiceColor(area.reactionService)} flex items-center justify-center`}
                                >
                                  <ReactionIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-green-600 font-medium">ALORS</p>
                                  <p className="text-sm font-semibold text-text capitalize">
                                    {area.reactionService}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleArea(area.id)}
                              className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                                area.active
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {area.active ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Activer
                                </>
                              )}
                            </motion.button>

                            <div className="relative">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  setActiveMenu(activeMenu === area.id ? null : area.id)
                                }
                                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </motion.button>

                              <AnimatePresence>
                                {activeMenu === area.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10"
                                  >
                                    <button
                                      onClick={() => {
                                        deleteArea(area.id);
                                        setActiveMenu(null);
                                      }}
                                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Supprimer
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activity indicator bar */}
                      {area.active && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="h-1 bg-gradient-to-r from-green-400 to-emerald-500 origin-left"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
