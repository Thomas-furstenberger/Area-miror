import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Fonctionnalités', href: '/#features', isExternal: false },
      { name: 'Intégrations', href: '/integrations', isExternal: false },
      { name: 'Services', href: '/services', isExternal: false },
      { name: 'Tarifs', href: '/pricing', isExternal: false },
    ],
    company: [
      { name: 'À propos', href: '#', isExternal: true },
      { name: 'Blog', href: '#', isExternal: true },
      { name: 'Carrières', href: '#', isExternal: true },
      { name: 'Contact', href: '/contact', isExternal: false },
    ],
    resources: [
      { name: 'Documentation', href: '/resources', isExternal: false },
      { name: 'API Reference', href: '/resources', isExternal: false },
      { name: 'Guides', href: '/resources', isExternal: false },
      { name: 'Support', href: '/contact', isExternal: false },
    ],
    legal: [
      { name: 'Confidentialité', href: '#', isExternal: true },
      { name: 'Conditions', href: '#', isExternal: true },
      { name: 'Cookies', href: '#', isExternal: true },
    ],
  };

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      href: 'https://github.com/Thomas-furstenberger/Area-miror',
      isExternal: true,
    },
    {
      name: 'Contact',
      icon: Mail,
      href: '/contact',
      isExternal: false,
    },
  ];

  return (
    <footer className="bg-dark text-background relative overflow-hidden" role="contentinfo">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
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
            <Link to="/" className="flex flex-col w-fit">
              <span className="text-2xl font-bold text-background tracking-wide">AREA</span>
              <svg
                className="w-12 h-3 -mt-1 text-background"
                viewBox="0 0 48 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4 Q 20 10, 38 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M34 0 L 40 4 L 34 8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </Link>
            <p className="text-background/70 leading-relaxed max-w-sm">
              Automatisez vos workflows et boostez votre productivité avec notre plateforme
              puissante et intuitive.
            </p>

            {/* Social Links Updated */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const buttonClasses =
                  'w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-background/70 hover:text-background hover:bg-primary transition-all duration-300';

                // Rendu conditionnel : Lien externe (<a>) ou interne (<Link>)
                if (social.isExternal) {
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={buttonClasses}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                } else {
                  return (
                    <Link key={social.name} to={social.href}>
                      <motion.div
                        whileHover={{ scale: 1.1, y: -2 }}
                        className={buttonClasses}
                        aria-label={social.name}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  );
                }
              })}
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
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        className="text-background/60 hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-background/60 hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
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
                    {link.isExternal ? (
                      <a
                        href={link.href}
                        className="text-background/60 hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-background/60 hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
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
                    <a
                      href={link.href}
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/70">© {currentYear} AREA. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-sm text-background/70">
            <span>Epitech Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
