import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import spotifyLogo from '../assets/logo-spotify.png';
import discordLogo from '../assets/logo-discord.png';
import googleLogo from '../assets/logo-google.png';
import githubLogo from '../assets/logo-github.png';

const integrations = [
  {
    name: 'GitHub',
    description: 'Synchronisez vos repos et automatisez vos workflows DevOps',
    icon: <img src={githubLogo} alt="GitHub" className="w-8 h-8 object-contain" />,
    color: 'bg-gray-900',
    features: ['Push events', 'PR automation', 'Issue tracking'],
    category: 'DevOps',
  },
  {
    name: 'Google',
    description: 'Gmail, YouTube et services Google intégrés',
    icon: <img src={googleLogo} alt="Google" className="w-8 h-8 object-contain" />,
    color: 'bg-white border border-gray-200',
    features: ['Gmail triggers', 'YouTube events', 'Google Calendar'],
    category: 'Productivité',
  },
  {
    name: 'Discord',
    description: 'Envoyez des notifications et gérez votre communauté',
    icon: <img src={discordLogo} alt="Discord" className="w-8 h-8 object-contain" />,
    color: 'bg-[#5865F2]',
    features: ['Webhooks', 'Bot messages', 'Channel management'],
    category: 'Communication',
  },
  {
    name: 'Spotify',
    description: 'Contrôlez votre musique et créez des automatisations audio',
    icon: <img src={spotifyLogo} alt="Spotify" className="w-8 h-8 object-contain" />,
    color: 'bg-[#1DB954]',
    features: ['Lecture musique', 'Playlists', 'Contrôle audio'],
    category: 'Divertissement',
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

const categories = ['Tous', 'DevOps', 'Communication', 'Productivité', 'Divertissement', 'Natif'];

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
