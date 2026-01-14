import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    name: 'Marie Dupont',
    role: 'CTO',
    company: 'TechStart',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    content:
      "AREA a complètement transformé notre façon de travailler. Nous avons automatisé plus de 50 tâches répétitives et économisé des heures chaque semaine. L'interface est intuitive et les intégrations sont excellentes.",
    rating: 5,
  },
  {
    name: 'Thomas Bernard',
    role: 'Head of Operations',
    company: 'ScaleUp Inc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    content:
      'Incroyable gain de temps ! Nos équipes DevOps utilisent AREA quotidiennement pour synchroniser GitHub avec Slack et notre système de ticketing. Tout fonctionne comme sur des roulettes.',
    rating: 5,
  },
  {
    name: 'Sophie Martin',
    role: 'Product Manager',
    company: 'InnovateLab',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    content:
      "La simplicité d'AREA est son plus grand atout. Même notre équipe marketing peut créer des automatisations sans l'aide des développeurs. C'est exactement ce dont nous avions besoin.",
    rating: 5,
  },
  {
    name: 'Lucas Chen',
    role: 'Founder',
    company: 'DataFlow',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    content:
      "Nous avons testé plusieurs solutions d'automatisation, et AREA est de loin la meilleure. Le support est réactif, les fonctionnalités sont complètes, et le prix est imbattable.",
    rating: 5,
  },
  {
    name: 'Emma Wilson',
    role: 'Engineering Lead',
    company: 'CloudNine',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    content:
      "AREA nous permet de connecter tous nos outils en un clin d'œil. Les webhooks personnalisés et l'API sont puissants tout en restant accessibles. Je recommande à 100% !",
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 bg-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
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
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/20 rounded-full text-primary font-medium text-sm mb-6"
          >
            Témoignages
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-background mb-6">
            Ce que nos clients
            <span className="block text-primary">disent de nous</span>
          </h2>
          <p className="text-xl text-background/60 max-w-2xl mx-auto">
            Découvrez pourquoi des milliers d'équipes choisissent AREA pour leurs automatisations.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="!overflow-visible py-10"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-500 h-full flex flex-col">
                    {/* Quote icon */}
                    <Quote className="w-10 h-10 text-primary/40 mb-6" />

                    {/* Content */}
                    <p className="text-background/80 leading-relaxed mb-8 flex-grow">
                      "{testimonial.content}"
                    </p>

                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full bg-primary/20"
                      />
                      <div>
                        <p className="font-semibold text-background">{testimonial.name}</p>
                        <p className="text-sm text-background/70">
                          {testimonial.role} @ {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-background transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {/* Pagination dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => swiperRef.current?.slideTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => swiperRef.current?.slideNext()}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-background transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
