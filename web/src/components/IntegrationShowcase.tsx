import { motion } from 'framer-motion';
import { useState } from 'react';
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
    name: 'Gmail',
    description: 'Automatisez vos emails et répondez plus rapidement',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
    color: 'bg-gradient-to-br from-red-500 to-yellow-500',
    features: ['Email triggers', 'Auto-responses', 'Label management'],
    category: 'Email',
  },
  {
    name: 'Slack',
    description: 'Intégrez vos workflows directement dans Slack',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
    color: 'bg-[#4A154B]',
    features: ['Channel posts', 'Direct messages', 'App mentions'],
    category: 'Communication',
  },
  {
    name: 'Notion',
    description: 'Synchronisez vos bases de données et pages',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.168c-.42-.326-.98-.7-2.055-.607L3.01 2.96c-.466.046-.56.28-.374.466l1.823 1.782zm.793 3.359v13.906c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.727c0-.606-.233-.933-.746-.886l-15.177.887c-.56.046-.747.326-.747.839zm14.337.745c.093.42 0 .84-.42.886l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.494-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.513.28-.886.747-.933l3.222-.187zM2.1.652l13.215-1.12c1.54-.14 1.914-.047 2.848.653l3.92 2.754c.653.466.886.606.886 1.12V21.58c0 1.213-.42 1.866-1.914 1.96l-15.503.886c-1.12.047-1.68-.14-2.287-.886L.7 20.6c-.7-.886-.98-1.54-.98-2.287V2.452C-.28 1.28.24.746 2.1.652z" />
      </svg>
    ),
    color: 'bg-black',
    features: ['Database sync', 'Page creation', 'Property updates'],
    category: 'Productivity',
  },
  {
    name: 'Stripe',
    description: 'Automatisez vos paiements et facturation',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
      </svg>
    ),
    color: 'bg-[#635BFF]',
    features: ['Payment webhooks', 'Invoice creation', 'Subscription management'],
    category: 'Finance',
  },
];

const categories = ['Tous', 'DevOps', 'Communication', 'Email', 'Productivity', 'Finance'];

export default function IntegrationShowcase() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [hoveredIntegration, setHoveredIntegration] = useState<string | null>(null);

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
            Plus de 500 intégrations pour automatiser l'ensemble de votre stack technologique.
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
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-text/50">
                  {integration.category}
                </span>

                {/* Hover overlay with action */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIntegration === integration.name ? 1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/70 rounded-3xl flex items-end justify-center p-8 pointer-events-none"
                >
                  <div className="text-center text-background">
                    <p className="font-semibold mb-4">Prêt à connecter {integration.name} ?</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-xl font-semibold pointer-events-auto"
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
