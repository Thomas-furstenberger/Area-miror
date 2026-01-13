import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
          >
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">Nous contacter</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Besoin d'aide avec <span className="text-secondary">AREA</span> ?
          </h1>
          <p className="text-xl text-text/60 max-w-2xl mx-auto">
            Notre équipe est là pour répondre à vos questions et vous accompagner dans vos projets
            d'automatisation.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Support</h3>
            <p className="text-secondary text-sm mb-3">
              Besoin d'aide avec votre compte ou une fonctionnalité ?
            </p>
            {/* <a href="mailto:support@area.com" className="text-primary font-medium text-sm hover:underline">
              support@area.com
            </a> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Partenariats</h3>
            <p className="text-secondary text-sm mb-3">Vous souhaitez collaborer avec nous ?</p>
            {/* <a href="mailto:partners@area.com" className="text-primary font-medium text-sm hover:underline">
              partners@area.com
            </a> */}
          </motion.div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-50" />

            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
              {/* Gradient header bar */}
              <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

              <div className="p-6 md:p-10">
                <div
                  className="elfsight-app-7ff885dd-fca6-4a65-ad21-e10d798a8fbb"
                  data-elfsight-app-lazy
                ></div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
