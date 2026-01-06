import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export default function CTASection() {
  const benefits = [
    'Gratuit pour commencer',
    'Pas de carte bancaire requise',
    'Support 24/7',
    'Annulez à tout moment',
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Card */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-[3rem] p-12 md:p-16 overflow-hidden shadow-2xl shadow-primary/30">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            {/* Sparkles decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-10 right-10"
            >
              <Sparkles className="w-8 h-8 text-white/30" />
            </motion.div>

            <div className="relative z-10 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-background font-medium text-sm mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Offre limitée : 3 mois gratuits
              </motion.div>

              {/* Heading */}
              <h2 className="text-4xl md:text-6xl font-bold text-background mb-6 leading-tight">
                Prêt à automatiser
                <br />
                <span className="text-background/80">votre quotidien ?</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl text-background/70 mb-10 max-w-2xl mx-auto">
                Rejoignez plus de 50 000 professionnels qui gagnent des heures chaque semaine grâce
                à AREA.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-10 py-5 bg-background text-primary rounded-2xl font-bold text-lg flex items-center gap-3 shadow-xl transition-all duration-300"
                  >
                    Créer un compte gratuit
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-sm text-background rounded-2xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Demander une démo
                </motion.button>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-background/70"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-background" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-text/40 text-sm">
            🔒 Vos données sont sécurisées et chiffrées de bout en bout
          </p>
        </motion.div>
      </div>
    </section>
  );
}
