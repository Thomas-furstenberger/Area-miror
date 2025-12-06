import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <LogIn size={32} className="text-primary" />
            </div>
          </div>
          <h1 className="text-h2">Login</h1>
          <p className="text-body text-secondary mt-2">Sign in to your AREA account</p>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-center text-secondary">Login page coming soon...</p>
          <Link to="/" className="block text-center text-link text-primary hover:opacity-80">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
