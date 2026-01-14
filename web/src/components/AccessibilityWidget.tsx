import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  X,
  ZoomIn,
  ZoomOut,
  Contrast,
  MousePointer2,
  Underline,
  PauseCircle,
  RotateCcw,
  Type,
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  largeCursor: boolean;
  highlightLinks: boolean;
  pauseAnimations: boolean;
  dyslexiaFont: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  largeCursor: false,
  highlightLinks: false,
  pauseAnimations: false,
  dyslexiaFont: false,
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Apply settings
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${settings.fontSize}%`;

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large cursor
    if (settings.largeCursor) {
      root.classList.add('large-cursor');
    } else {
      root.classList.remove('large-cursor');
    }

    // Highlight links
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }

    // Pause animations
    if (settings.pauseAnimations) {
      root.classList.add('pause-animations');
    } else {
      root.classList.remove('pause-animations');
    }

    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const increaseFontSize = () => {
    setSettings((prev) => ({ ...prev, fontSize: Math.min(prev.fontSize + 10, 150) }));
  };

  const decreaseFontSize = () => {
    setSettings((prev) => ({ ...prev, fontSize: Math.max(prev.fontSize - 10, 80) }));
  };

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    if (key === 'fontSize') return;
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(defaultSettings);

  return (
    <>
      {/* Accessibility Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Ouvrir les options d'accessibilité"
      >
        <Accessibility className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Accessibility className="w-6 h-6" />
                  <span className="font-bold text-lg">Accessibilité</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Font Size */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-gray-800">Taille du texte</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={decreaseFontSize}
                      disabled={settings.fontSize <= 80}
                      className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Réduire la taille du texte"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold text-primary">{settings.fontSize}%</span>
                    <button
                      onClick={increaseFontSize}
                      disabled={settings.fontSize >= 150}
                      className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Augmenter la taille du texte"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-2">
                  {/* High Contrast */}
                  <button
                    onClick={() => toggleSetting('highContrast')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.highContrast
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.highContrast
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Contrast className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Contraste élevé</p>
                      <p className="text-sm text-gray-500">Améliore la lisibilité</p>
                    </div>
                  </button>

                  {/* Large Cursor */}
                  <button
                    onClick={() => toggleSetting('largeCursor')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.largeCursor
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.largeCursor ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MousePointer2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Grand curseur</p>
                      <p className="text-sm text-gray-500">Curseur plus visible</p>
                    </div>
                  </button>

                  {/* Highlight Links */}
                  <button
                    onClick={() => toggleSetting('highlightLinks')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.highlightLinks
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.highlightLinks
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Underline className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Surligner les liens</p>
                      <p className="text-sm text-gray-500">Liens plus visibles</p>
                    </div>
                  </button>

                  {/* Pause Animations */}
                  <button
                    onClick={() => toggleSetting('pauseAnimations')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.pauseAnimations
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.pauseAnimations
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <PauseCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Pause animations</p>
                      <p className="text-sm text-gray-500">Désactive les mouvements</p>
                    </div>
                  </button>

                  {/* Dyslexia Font */}
                  <button
                    onClick={() => toggleSetting('dyslexiaFont')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      settings.dyslexiaFont
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        settings.dyslexiaFont
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Type className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Police dyslexie</p>
                      <p className="text-sm text-gray-500">Facilite la lecture</p>
                    </div>
                  </button>
                </div>

                {/* Reset Button */}
                {hasChanges && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={resetSettings}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser les paramètres
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
