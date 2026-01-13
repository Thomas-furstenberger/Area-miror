import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Fonctionnalités', href: '#features' },
      { name: 'Intégrations', href: '#integrations' },
      { name: 'Tarifs', href: '#pricing' },
      { name: 'Changelog', href: '#changelog' },
      { name: 'Roadmap', href: '#roadmap' },
    ],
    company: [
      { name: 'À propos', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Carrières', href: '#careers' },
      { name: 'Presse', href: '#press' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
      { name: 'Guides', href: '#guides' },
      { name: 'Communauté', href: '#community' },
      { name: 'Support', href: '#support' },
    ],
    legal: [
      { name: 'Confidentialité', href: '#privacy' },
      { name: 'Conditions', href: '#terms' },
      { name: 'Cookies', href: '#cookies' },
      { name: 'Licences', href: '#licenses' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@area.com' },
  ];

  return (
    <footer className="bg-dark text-background relative overflow-hidden" role="contentinfo">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Restez informé des nouveautés
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-background/60 mb-8"
            >
              Recevez nos dernières fonctionnalités, guides et astuces directement dans votre boîte
              mail.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <input
                type="email"
                placeholder="Entrez votre email"
                className="px-6 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 focus:border-primary focus:outline-none text-background placeholder-background/50 w-full sm:w-80"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="group px-8 py-4 bg-primary text-background rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                S'abonner
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-background font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-background">AREA</span>
            </Link>
            <p className="text-background/70 leading-relaxed">
              Automatisez vos workflows et boostez votre productivité avec notre plateforme
              puissante et intuitive.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-background/70 hover:text-background hover:bg-primary transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Produit</h4>
            <nav aria-label="Product links">
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Entreprise</h4>
            <nav aria-label="Company links">
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Ressources</h4>
            <nav aria-label="Resources links">
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Légal</h4>
            <nav aria-label="Legal links">
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/70">© {currentYear} AREA. Tous droits réservés.</p>
          <p className="flex items-center gap-2 text-sm text-background/70"></p>
        </div>
      </div>
    </footer>
  );
}
