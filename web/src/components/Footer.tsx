import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-background py-12 px-4 sm:px-6 lg:px-8" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">AREA</h3>
            <p className="text-sm text-background/80">
              Automate your workflows and boost productivity with our powerful platform.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Product</h4>
            <nav aria-label="Product links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#features"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#how-it-works"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    to="#pricing"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Company</h4>
            <nav aria-label="Company links">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="#about"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="#blog"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#contact"
                    className="text-background/80 hover:text-background transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Social Column */}
          <div className="space-y-4">
            <h4 className="font-semibold text-background">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/80 hover:text-background transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/80 hover:text-background transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/80 hover:text-background transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:contact@area.com"
                className="text-background/80 hover:text-background transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/80">
          <p>© {currentYear} AREA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#privacy" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link to="#terms" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
