import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Users, Zap, Globe, Clock } from 'lucide-react';

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

function AnimatedStat({ value, suffix, label, icon, delay = 0 }: StatProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(count, value, { duration: 2, delay });
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [count, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/80 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
        {/* Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-background mb-6 shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>

        {/* Number */}
        <div className="flex items-baseline gap-1 mb-2">
          <motion.span className="text-5xl font-bold text-text">{rounded}</motion.span>
          <span className="text-3xl font-bold text-primary">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-text/60 font-medium">{label}</p>

        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      </div>
    </motion.div>
  );
}

const stats = [
  {
    value: 50000,
    suffix: '+',
    label: 'Utilisateurs actifs',
    icon: <Users className="w-7 h-7" />,
  },
  {
    value: 10,
    suffix: 'M+',
    label: 'Workflows exécutés',
    icon: <Zap className="w-7 h-7" />,
  },
  {
    value: 500,
    suffix: '+',
    label: 'Intégrations',
    icon: <Globe className="w-7 h-7" />,
  },
  {
    value: 99.9,
    suffix: '%',
    label: 'Uptime garanti',
    icon: <Clock className="w-7 h-7" />,
  },
];

export default function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Des chiffres qui parlent
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Rejoignez des milliers d'équipes qui font confiance à AREA pour automatiser leurs tâches
            quotidiennes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              delay={index * 0.15}
            />
          ))}
        </div>

        {/* Trust logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-text/40 text-sm uppercase tracking-wider mb-8">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
              <motion.div
                key={company}
                whileHover={{ scale: 1.1, opacity: 1 }}
                className="text-2xl font-bold text-text/70"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
