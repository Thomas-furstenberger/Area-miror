import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-section px-4 sm:px-6 lg:px-8" aria-labelledby="hero-title">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Zap size={48} className="text-primary" aria-hidden="true" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 id="hero-title" className="text-h1 max-w-4xl mx-auto">
            Action-Reaction: Create an Automation Platform
          </h1>

          {/* Subtitle */}
          <p className="text-body text-secondary max-w-2xl mx-auto text-lg">
            Connect your favorite services and automate your workflows effortlessly. Build powerful
            automation chains without writing a single line of code.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background rounded-lg hover:opacity-90 transition-opacity font-medium text-lg shadow-lg"
            >
              Get Started
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              to="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition-all font-medium text-lg"
            >
              Learn More
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-secondary/80 pt-8">
            Join <strong className="text-primary">10,000+</strong> users automating their daily
            tasks
          </p>
        </div>
      </div>
    </section>
  );
}
