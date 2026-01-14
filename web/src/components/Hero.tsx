import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  scrollY?: number;
}

export default function Hero({ scrollY = 0 }: HeroProps) {
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#474973 1px, transparent 1px), linear-gradient(90deg, #474973 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />

        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Nouvelle génération d'automatisation
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-text mb-6 leading-tight"
          >
            Automatisez
            <span className="relative mx-4">
              <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                tout
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-2 left-0 right-0 h-4 bg-primary/20 -z-10 origin-left"
              />
            </span>
            <br />
            <span className="text-secondary">sans coder</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-text/70 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Connectez vos applications favorites et créez des workflows puissants en quelques clics.
            Plus de 500+ intégrations disponibles.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(71, 73, 115, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="group px-8 py-4 bg-primary text-background rounded-2xl font-semibold text-lg flex items-center gap-3 shadow-lg shadow-primary/25 transition-all duration-300"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-white/50 backdrop-blur-sm text-text rounded-2xl font-semibold text-lg flex items-center gap-3 border border-primary/20 hover:border-primary/40 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="w-4 h-4 text-primary ml-0.5" />
              </div>
              Voir la démo
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 text-text/70 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Sécurisé & chiffré</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Setup en 2 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Sans carte bancaire</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Integration Cards */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* GitHub Card */}
          <motion.div
            animate={floatingAnimation}
            className="absolute top-32 left-20 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text text-sm">GitHub</p>
                <p className="text-xs text-text/70">Nouveau commit détecté</p>
              </div>
            </div>
          </motion.div>

          {/* Discord Card */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
            className="absolute top-48 right-24 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text text-sm">Discord</p>
                <p className="text-xs text-text/70">Message envoyé ✓</p>
              </div>
            </div>
          </motion.div>

          {/* Gmail Card */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            }}
            className="absolute bottom-40 left-32 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner border border-gray-100">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="#EA4335"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text text-sm">Gmail</p>
                <p className="text-xs text-text/70">3 nouveaux emails</p>
              </div>
            </div>
          </motion.div>

          {/* Connection Lines SVG */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#474973" stopOpacity="0" />
                <stop offset="50%" stopColor="#474973" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#474973" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 150 200 Q 400 300 650 250"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
            />
          </svg>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
}
