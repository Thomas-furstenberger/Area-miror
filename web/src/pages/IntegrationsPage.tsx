import { motion } from 'framer-motion';
import { Search, Filter, Check, Zap, Star, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import spotifyLogo from '../assets/logo-spotify.png';
import discordLogo from '../assets/logo-discord.png';
import googleLogo from '../assets/logo-google.png';
import githubLogo from '../assets/logo-github.png';

const categories = [
  { id: 'all', name: 'Toutes', count: 6 },
  { id: 'development', name: 'Développement', count: 1 },
  { id: 'communication', name: 'Communication', count: 1 },
  { id: 'productivity', name: 'Productivité', count: 1 },
  { id: 'entertainment', name: 'Divertissement', count: 1 },
  { id: 'native', name: 'Natif', count: 2 },
];

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automatisez vos workflows de développement avec les événements GitHub.',
    category: 'development',
    icon: <img src={githubLogo} alt="GitHub" className="w-8 h-8 object-contain" />,
    bgColor: 'bg-gray-900',
    triggers: ['Push', 'Pull Request', 'Issue', 'Release', 'Star'],
    actions: ['Create Issue', 'Create Comment', 'Merge PR'],
    popular: true,
    docsUrl: '/docs/integrations/github',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gmail, YouTube et services Google intégrés pour vos automatisations.',
    category: 'productivity',
    icon: <img src={googleLogo} alt="Google" className="w-8 h-8 object-contain" />,
    bgColor: 'bg-white border border-gray-200',
    triggers: ['Nouvel email', 'Nouvelle vidéo YouTube', 'Événement calendrier'],
    actions: ['Envoyer email', 'Créer événement', 'Ajouter label'],
    popular: true,
    docsUrl: '/docs/integrations/google',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Envoyez des messages et gérez votre serveur Discord automatiquement.',
    category: 'communication',
    icon: <img src={discordLogo} alt="Discord" className="w-8 h-8 object-contain" />,
    bgColor: 'bg-[#5865F2]',
    triggers: ['Message reçu', 'Membre rejoint', 'Réaction ajoutée'],
    actions: ['Envoyer message', 'Envoyer embed', 'Ajouter rôle'],
    popular: true,
    docsUrl: '/docs/integrations/discord',
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Déclencheurs temporels et planifiés pour vos automatisations.',
    category: 'native',
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    bgColor: 'bg-gray-700',
    triggers: ['Intervalle', 'Cron expression', 'Date spécifique'],
    actions: [],
    popular: false,
    isNative: true,
    docsUrl: '/docs/integrations/timer',
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Réagissez aux conditions météorologiques en temps réel.',
    category: 'native',
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
    bgColor: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    triggers: ['Température seuil', 'Pluie détectée', 'Alerte météo'],
    actions: [],
    popular: false,
    isNative: true,
    docsUrl: '/docs/integrations/weather',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Contrôlez votre musique et créez des automatisations audio.',
    category: 'entertainment',
    icon: <img src={spotifyLogo} alt="Spotify" className="w-8 h-8 object-contain" />,
    bgColor: 'bg-[#1DB954]',
    triggers: ['Nouvelle chanson jouée', 'Playlist mise à jour'],
    actions: ['Jouer musique', 'Ajouter à playlist', 'Contrôler lecture'],
    popular: true,
    docsUrl: '/docs/integrations/spotify',
  },
];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="container mx-auto px-6 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Intégrations disponibles</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-text mb-6"
          >
            Connectez vos{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              applications
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text/60 max-w-2xl mx-auto mb-10"
          >
            Des intégrations natives avec les outils que vous utilisez déjà. Pas de code, pas de
            configuration complexe.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Rechercher une intégration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </motion.div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {category.name}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${integration.bgColor}`}
                  >
                    {integration.icon}
                  </div>
                  {integration.popular && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                      <Star className="w-3 h-3 text-yellow-600" fill="currentColor" />
                      <span className="text-xs font-medium text-yellow-700">Populaire</span>
                    </div>
                  )}
                  {integration.isNative && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Natif</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {integration.name}
                </h3>
                <p className="text-text/60 text-sm mb-4 line-clamp-2">{integration.description}</p>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide mb-1">
                      Triggers
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {integration.triggers.slice(0, 3).map((trigger) => (
                        <span
                          key={trigger}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text/40 uppercase tracking-wide mb-1">
                      Actions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {integration.actions.slice(0, 3).map((action) => (
                        <span
                          key={action}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start pt-4 border-t border-gray-100">
                  <Link
                    to={integration.docsUrl}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text/70 text-lg">
                Aucune intégration trouvée pour cette recherche.
              </p>
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Pourquoi nos intégrations sont différentes
              </h2>
              <p className="text-text/60 max-w-2xl mx-auto">
                Des connecteurs fiables, rapides et faciles à configurer
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: 'Temps réel',
                  description:
                    'Nos intégrations se déclenchent instantanément, sans délai ni polling.',
                },
                {
                  icon: Check,
                  title: 'Sans code',
                  description:
                    'Configuration visuelle en quelques clics. Pas besoin de compétences techniques.',
                },
                {
                  icon: Filter,
                  title: 'Filtres avancés',
                  description:
                    'Filtrez précisément les événements qui déclenchent vos automatisations.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                  <p className="text-text/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
