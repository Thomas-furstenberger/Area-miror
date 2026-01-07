import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, XCircle } from 'lucide-react';

export default function LoginSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine status based on URL params
  const token = searchParams.get('token');
  const status: 'success' | 'error' = token ? 'success' : 'error';

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved:', token);

      const successTimer = setTimeout(() => {
        navigate('/areas');
      }, 2000);
      return () => clearTimeout(successTimer);
    } else {
      console.error('No token received');

      const errorTimer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(errorTimer);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
      >
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-green-100 rounded-full" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>
              {/* Celebration particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 60,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 60,
                  }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 w-3 h-3"
                >
                  <Sparkles className="w-full h-full text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-text mb-3"
            >
              Connexion réussie !
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-secondary mb-6"
            >
              Vous allez être redirigé vers vos automatisations...
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-primary to-green-500 rounded-full"
            />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-text mb-3">Erreur de connexion</h1>
            <p className="text-secondary mb-6">
              Aucun token reçu. Redirection vers la page de connexion...
            </p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
