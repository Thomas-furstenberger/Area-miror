import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import {
  Workflow,
  Zap,
  Shield,
  Clock,
  Puzzle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const features = [
  {
    icon: Workflow,
    title: 'Workflows visuels',
    description:
      'Créez des automatisations complexes avec notre éditeur drag & drop intuitif. Aucune compétence technique requise.',
    gradient: 'from-blue-500 to-cyan-500',
    image: '🔄',
  },
  {
    icon: Zap,
    title: 'Exécution instantanée',
    description:
      'Vos workflows se déclenchent en temps réel. Réagissez instantanément aux événements de vos applications.',
    gradient: 'from-yellow-500 to-orange-500',
    image: '⚡',
  },
  {
    icon: Shield,
    title: 'Sécurité enterprise',
    description:
      "Chiffrement de bout en bout, conformité RGPD et audit logs complets pour une tranquillité d'esprit totale.",
    gradient: 'from-green-500 to-emerald-500',
    image: '🛡️',
  },
  {
    icon: Clock,
    title: 'Planification avancée',
    description:
      'Programmez vos automatisations avec des déclencheurs temporels flexibles. Cron, intervalles, dates précises.',
    gradient: 'from-purple-500 to-pink-500',
    image: '⏰',
  },
  {
    icon: Puzzle,
    title: '500+ intégrations',
    description:
      'Connectez tous vos outils favoris : GitHub, Discord, Gmail, Slack, et bien plus encore.',
    gradient: 'from-red-500 to-rose-500',
    image: '🧩',
  },
  {
    icon: BarChart3,
    title: 'Analytics détaillés',
    description:
      'Suivez les performances de vos workflows avec des métriques en temps réel et des rapports personnalisés.',
    gradient: 'from-indigo-500 to-violet-500',
    image: '📊',
  },
];

export default function FeaturesCarousel() {
  const swiperRef = useRef<SwiperType>();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
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
            Fonctionnalités
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-text mb-6">
            Tout ce dont vous avez
            <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              besoin pour automatiser
            </span>
          </h2>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Des outils puissants conçus pour vous faire gagner du temps et booster votre
            productivité.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2.5 },
              1280: { slidesPerView: 3 },
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2,
              slideShadows: false,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="!overflow-visible py-10"
          >
            {features.map((feature, index) => (
              <SwiperSlide key={index}>
                {({ isActive }) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative group transition-all duration-500 ${
                      isActive ? 'scale-100' : 'scale-90 opacity-60'
                    }`}
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 h-full">
                      {/* Icon with gradient background */}
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-text mb-4 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-text/60 leading-relaxed mb-6">{feature.description}</p>

                      {/* Decorative emoji */}
                      <div className="absolute top-6 right-6 text-5xl opacity-20 group-hover:opacity-40 transition-opacity">
                        {feature.image}
                      </div>

                      {/* Learn more link */}
                      <motion.a
                        whileHover={{ x: 5 }}
                        href="#"
                        className="inline-flex items-center gap-2 text-primary font-semibold"
                      >
                        En savoir plus
                        <ChevronRight className="w-4 h-4" />
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-background flex items-center justify-center text-primary transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {features.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => swiperRef.current?.slideNext()}
              className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-background flex items-center justify-center text-primary transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
