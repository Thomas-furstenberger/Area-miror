import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import FeaturesCarousel from '../components/FeaturesCarousel';
import IntegrationShowcase from '../components/IntegrationShowcase';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import HowItWorks from '../components/HowItWorks';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <Hero scrollY={scrollY} />
        <StatsSection />
        <FeaturesCarousel />
        <IntegrationShowcase />
        <HowItWorks />
        <TestimonialsCarousel />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
