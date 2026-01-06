import { motion } from 'framer-motion';
import { Workflow, Plug, Rocket, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Plug,
      title: 'Connectez vos services',
      description:
        'Liez vos applications favorites en quelques clics. Plus de 500 intégrations disponibles.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Workflow,
      title: 'Créez vos automatisations',
      description:
        'Définissez des déclencheurs et des actions. Construisez des workflows complexes sans coder.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Rocket,
      title: 'Laissez la magie opérer',
      description:
        'Vos automatisations tournent 24/7 en arrière-plan, vous faisant gagner un temps précieux.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-32 bg-white relative overflow-hidden"
      aria-labelledby="how-it-works-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6"
          >
            Comment ça marche
          </motion.span>
          <h2 id="how-it-works-title" className="text-4xl md:text-6xl font-bold text-text mb-6">
            Trois étapes pour
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              tout automatiser
            </span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Commencez à automatiser vos tâches en moins de 5 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-1/2 w-full h-0.5">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                      className="h-full bg-gradient-to-r from-primary/30 to-primary/10 origin-left"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
                    >
                      <ArrowRight className="w-5 h-5 text-primary/40" />
                    </motion.div>
                  </div>
                )}

                <div className="relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/70 text-background rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/25"
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon */}
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-text mb-4 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-text/60 leading-relaxed">{step.description}</p>

                  {/* Decorative gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-background rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
