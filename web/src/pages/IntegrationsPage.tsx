import { motion } from 'framer-motion';
import { Search, Filter, Check, Zap, Star, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  { id: 'all', name: 'Toutes', count: 5 },
  { id: 'development', name: 'Développement', count: 1 },
  { id: 'communication', name: 'Communication', count: 1 },
  { id: 'productivity', name: 'Productivité', count: 1 },
  { id: 'native', name: 'Natif', count: 2 },
];

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Automatisez vos workflows de développement avec les événements GitHub.',
    category: 'development',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    color: '#181717',
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
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: '#4285F4',
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
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
      </svg>
    ),
    color: '#5865F2',
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
    color: '#374151',
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
    color: '#06B6D4',
    triggers: ['Température seuil', 'Pluie détectée', 'Alerte météo'],
    actions: [],
    popular: false,
    isNative: true,
    docsUrl: '/docs/integrations/weather',
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
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${integration.color}15` }}
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
