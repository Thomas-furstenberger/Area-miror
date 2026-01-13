import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';

const integrations = [
  {
    name: 'GitHub',
    description: 'Synchronisez vos repos et automatisez vos workflows DevOps',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    color: 'bg-gray-900',
    features: ['Push events', 'PR automation', 'Issue tracking'],
    category: 'DevOps',
  },
  {
    name: 'Google',
    description: 'Gmail, YouTube et services Google intégrés',
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
    color: 'bg-white border border-gray-200',
    features: ['Gmail triggers', 'YouTube events', 'Google Calendar'],
    category: 'Productivité',
  },
  {
    name: 'Discord',
    description: 'Envoyez des notifications et gérez votre communauté',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    color: 'bg-[#5865F2]',
    features: ['Webhooks', 'Bot messages', 'Channel management'],
    category: 'Communication',
  },
  {
    name: 'Timer',
    description: 'Déclencheurs temporels et planifiés',
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
    color: 'bg-gray-700',
    features: ['Cron jobs', 'Intervalles', 'Dates spécifiques'],
    category: 'Natif',
    isNative: true,
  },
  {
    name: 'Weather',
    description: 'Réagissez aux conditions météorologiques',
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
    color: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    features: ['Alertes météo', 'Température', 'Prévisions'],
    category: 'Natif',
    isNative: true,
  },
];

const categories = ['Tous', 'DevOps', 'Communication', 'Productivité', 'Natif'];

export default function IntegrationShowcase() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [hoveredIntegration, setHoveredIntegration] = useState<string | null>(null);

  const handleConfigureClick = useCallback(
    (serviceName: string) => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate(`/services?service=${serviceName.toLowerCase()}`);
      } else {
        navigate('/login');
      }
    },
    [navigate]
  );

  const filteredIntegrations =
    activeCategory === 'Tous'
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  return (
    <section className="py-32 bg-gradient-to-b from-white to-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #474973 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6"
          >
            Intégrations
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-text mb-6">
            Connectez vos
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              outils favoris
            </span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Des intégrations pour automatiser l'ensemble de votre stack technologique.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-background shadow-lg shadow-primary/25'
                  : 'bg-white text-text/70 hover:bg-primary/10 hover:text-primary border border-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Integrations Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIntegration(integration.name)}
              onMouseLeave={() => setHoveredIntegration(null)}
              className="group relative"
            >
              <div
                className={`relative bg-white rounded-3xl p-8 border border-gray-100 transition-all duration-500 ${
                  hoveredIntegration === integration.name
                    ? 'shadow-2xl border-primary/30 -translate-y-2'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${integration.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                >
                  {integration.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
                  {integration.name}
                </h3>
                <p className="text-text/60 mb-6 leading-relaxed">{integration.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {integration.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-text/70"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* Category tag */}
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-text/70">
                  {integration.category}
                </span>

                {/* Hover overlay with action */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIntegration === integration.name ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center pointer-events-none"
                >
                  <div className="text-center">
                    <div
                      className={`w-16 h-16 ${integration.color} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg`}
                    >
                      {integration.icon}
                    </div>
                    <p className="font-bold text-text text-lg mb-2">{integration.name}</p>
                    <p className="text-text/60 text-sm mb-4">Prêt à connecter ?</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleConfigureClick(integration.name)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold pointer-events-auto text-sm hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      Configurer
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/integrations')}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary/10 text-primary rounded-2xl font-semibold hover:bg-primary hover:text-background transition-all duration-300"
          >
            Voir toutes les intégrations
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
