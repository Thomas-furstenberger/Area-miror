import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className="bg-background border-b border-secondary/20"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-primary hover:opacity-100"
            aria-label="AREA Home"
          >
            AREA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-link text-primary hover:opacity-80 transition-opacity">
              Home
            </Link>
            <Link
              to="#features"
              className="text-link text-primary hover:opacity-80 transition-opacity"
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="text-link text-primary hover:opacity-80 transition-opacity"
            >
              How it works
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-link text-primary hover:opacity-80 transition-opacity"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-primary text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary hover:opacity-80 transition-opacity"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-secondary/20">
            <Link
              to="/"
              className="block text-link text-primary hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="#features"
              className="block text-link text-primary hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="block text-link text-primary hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              How it works
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t border-secondary/20">
              <Link
                to="/login"
                className="text-center px-6 py-2 text-link text-primary hover:opacity-80 transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-center px-6 py-2 bg-primary text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
