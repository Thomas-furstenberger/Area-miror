import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Zap,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Github,
  Mail,
  Clock,
  MessageSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { API_URL } from '../config';

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'url' | 'time' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

interface Action {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

interface Reaction {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

interface Service {
  name: string;
  actions: Action[];
  reactions: Reaction[];
}

// Service icons mapping
const serviceIcons: Record<string, React.ReactNode> = {
  github: <Github className="w-5 h-5" />,
  gmail: <Mail className="w-5 h-5" />,
  timer: <Clock className="w-5 h-5" />,
  discord: <MessageSquare className="w-5 h-5" />,
};

// Service colors mapping
const serviceColors: Record<
  string,
  { bg: string; text: string; border: string; gradient: string }
> = {
  github: {
    bg: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
    gradient: 'from-gray-800 to-gray-900',
  },
  gmail: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-400',
    gradient: 'from-red-500 to-red-600',
  },
  timer: {
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-400',
    gradient: 'from-blue-500 to-blue-600',
  },
  discord: {
    bg: 'bg-indigo-500',
    text: 'text-white',
    border: 'border-indigo-400',
    gradient: 'from-indigo-500 to-indigo-600',
  },
};

export default function CreateAreaPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [areaName, setAreaName] = useState('');
  const [areaDescription, setAreaDescription] = useState('');
  const [selectedActionService, setSelectedActionService] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [actionConfig, setActionConfig] = useState<Record<string, unknown>>({});
  const [selectedReactionService, setSelectedReactionService] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [reactionConfig, setReactionConfig] = useState<Record<string, unknown>>({});

  // Current step for visual feedback
  const currentStep = !areaName ? 1 : !selectedAction ? 2 : !selectedReaction ? 3 : 4;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/about.json`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data.server?.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let finalActionConfig = { ...actionConfig };

      if (selectedActionService === 'timer') {
        if (selectedAction === 'time_reached' && typeof finalActionConfig.time === 'string') {
          const [hourStr, minuteStr] = finalActionConfig.time.split(':');
          finalActionConfig = {
            ...finalActionConfig,
            hour: parseInt(hourStr, 10),
            minute: parseInt(minuteStr, 10),
          };
        }

        if (selectedAction === 'day_of_week' && finalActionConfig.day) {
          finalActionConfig = {
            ...finalActionConfig,
            dayOfWeek: parseInt(String(finalActionConfig.day), 10),
          };
        }
      }

      const response = await fetch(`${API_URL}/api/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: areaName,
          description: areaDescription,
          actionService: selectedActionService,
          actionType: selectedAction,
          actionConfig: finalActionConfig,
          reactionService: selectedReactionService,
          reactionType: selectedReaction,
          reactionConfig: reactionConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create AREA');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/areas');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const getServiceActions = (): Action[] => {
    return services.find((s) => s.name === selectedActionService)?.actions || [];
  };

  const getServiceReactions = (): Reaction[] => {
    return services.find((s) => s.name === selectedReactionService)?.reactions || [];
  };

  const getSelectedActionConfig = (): ConfigField[] => {
    const action = getServiceActions().find((a) => a.name === selectedAction);
    return action?.configFields || [];
  };

  const getSelectedReactionConfig = (): ConfigField[] => {
    const reaction = getServiceReactions().find((r) => r.name === selectedReaction);
    return reaction?.configFields || [];
  };

  const handleActionConfigChange = (fieldName: string, value: string | number | boolean) => {
    setActionConfig({ ...actionConfig, [fieldName]: value });
  };

  const handleReactionConfigChange = (fieldName: string, value: string | number | boolean) => {
    setReactionConfig({ ...reactionConfig, [fieldName]: value });
  };

  const renderConfigField = (
    field: ConfigField,
    value: string | number | boolean | undefined,
    onChange: (name: string, value: string | number | boolean) => void,
    colorScheme: 'blue' | 'purple' = 'blue'
  ) => {
    const focusColor =
      colorScheme === 'blue'
        ? 'focus:border-blue-500 focus:ring-blue-500/20'
        : 'focus:border-purple-500 focus:ring-purple-500/20';
    const baseClasses = `w-full px-4 py-3 bg-white/50 border-2 border-secondary/30 rounded-xl ${focusColor} focus:ring-4 focus:outline-none transition-all duration-200`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            required={field.required}
            value={String(value || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${baseClasses} resize-none`}
          />
        );
      case 'select':
        return (
          <select
            required={field.required}
            value={String(value || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={`${baseClasses} bg-white`}
          >
            <option value="">Choisir...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            required={field.required}
            value={String(value || '')}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
    }
  };

  const isFormValid = areaName && selectedAction && selectedReaction;

  // Steps indicator
  const steps = [
    { num: 1, label: 'Nom', completed: !!areaName },
    { num: 2, label: 'Action', completed: !!selectedAction },
    { num: 3, label: 'Réaction', completed: !!selectedReaction },
    { num: 4, label: 'Créer', completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-dark py-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Créer une automatisation
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nouvelle <span className="text-secondary">AREA</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Connectez une action à une réaction pour automatiser vos tâches en quelques clics
            </p>

            {/* Progress Steps */}
            <div className="mt-10 flex justify-center">
              <div className="flex items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-3">
                {steps.map((step, index) => (
                  <div key={step.num} className="flex items-center">
                    <motion.div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300 ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : currentStep === step.num
                            ? 'bg-white text-primary'
                            : 'bg-white/20 text-white/60'
                      }`}
                      animate={currentStep === step.num ? { scale: [1, 1.1, 1] } : {}}
                      transition={{
                        duration: 0.5,
                        repeat: currentStep === step.num ? Infinity : 0,
                        repeatDelay: 1,
                      }}
                    >
                      {step.completed ? <Check className="w-4 h-4" /> : step.num}
                    </motion.div>
                    <span
                      className={`hidden md:block ml-2 text-sm ${currentStep === step.num ? 'text-white' : 'text-white/60'}`}
                    >
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-white/40 ml-2 md:ml-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-16 h-16 text-primary" />
              </motion.div>
              <p className="text-secondary mt-4 text-lg">Chargement des services...</p>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-12 text-center overflow-hidden"
            >
              {/* Success particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut',
                  }}
                />
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-green-800 mb-3">AREA créée avec succès !</h2>
              <p className="text-green-600 text-lg">Redirection vers vos AREAs...</p>

              <motion.div className="mt-6 h-1 bg-green-200 rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'linear' }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Area Name Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-secondary/20 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    Informations de l'AREA
                  </h2>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Nom de l'AREA <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      placeholder="Ex: Notification GitHub → Discord"
                      className="w-full px-4 py-3 bg-background/50 border-2 border-secondary/30 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Description <span className="text-secondary text-xs">(optionnelle)</span>
                    </label>
                    <textarea
                      value={areaDescription}
                      onChange={(e) => setAreaDescription(e.target.value)}
                      placeholder="Décrivez ce que fait cette automatisation..."
                      rows={3}
                      className="w-full px-4 py-3 bg-background/50 border-2 border-secondary/30 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Action & Reaction Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {/* Arrow connector for desktop */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    className="bg-white p-4 rounded-full shadow-xl border-2 border-primary"
                    whileHover={{ scale: 1.1 }}
                    animate={{
                      boxShadow: selectedAction
                        ? [
                            '0 0 0 0 rgba(71, 73, 115, 0)',
                            '0 0 0 10px rgba(71, 73, 115, 0.2)',
                            '0 0 0 0 rgba(71, 73, 115, 0)',
                          ]
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    transition={{ duration: 1.5, repeat: selectedAction ? Infinity : 0 }}
                  >
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                {/* ACTION Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">SI</h3>
                        <p className="text-blue-100 text-sm">Action déclencheuse</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Service déclencheur <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={selectedActionService}
                          onChange={(e) => {
                            setSelectedActionService(e.target.value);
                            setSelectedAction('');
                            setActionConfig({});
                          }}
                          className="w-full px-4 py-3 bg-blue-50/50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 appearance-none"
                        >
                          <option value="">Choisir un service</option>
                          {services
                            .filter((s) => s.actions.length > 0)
                            .map((service) => (
                              <option key={service.name} value={service.name}>
                                {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                              </option>
                            ))}
                        </select>
                        {selectedActionService && (
                          <div
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 ${serviceColors[selectedActionService]?.bg || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white`}
                          >
                            {serviceIcons[selectedActionService] || <Zap className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.div
                      className={!selectedActionService ? 'opacity-50 pointer-events-none' : ''}
                      animate={{ opacity: selectedActionService ? 1 : 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-text mb-2">
                        Événement déclencheur <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!selectedActionService}
                        value={selectedAction}
                        onChange={(e) => {
                          setSelectedAction(e.target.value);
                          setActionConfig({});
                        }}
                        className="w-full px-4 py-3 bg-blue-50/50 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >
                        <option value="">Choisir un événement</option>
                        {getServiceActions().map((action) => (
                          <option key={action.name} value={action.name}>
                            {action.description}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <AnimatePresence>
                      {selectedAction && getSelectedActionConfig().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-5 border-t-2 border-blue-100"
                        >
                          <h4 className="font-semibold text-sm text-blue-600 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configuration
                          </h4>
                          <div className="space-y-4">
                            {getSelectedActionConfig().map((field) => (
                              <div key={field.name}>
                                <label className="block text-sm font-semibold text-text mb-2">
                                  {field.label}{' '}
                                  {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {renderConfigField(
                                  field,
                                  actionConfig[field.name] as string | number | boolean | undefined,
                                  handleActionConfigChange,
                                  'blue'
                                )}
                                {field.description && (
                                  <p className="text-xs text-gray-500 mt-1.5">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Mobile Arrow */}
                <div className="flex lg:hidden justify-center -my-2">
                  <motion.div
                    className="bg-white p-3 rounded-full shadow-lg border-2 border-primary rotate-90"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </motion.div>
                </div>

                {/* REACTION Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl border border-purple-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">ALORS</h3>
                        <p className="text-purple-100 text-sm">Réaction à exécuter</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">
                        Service de réaction <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={selectedReactionService}
                          onChange={(e) => {
                            setSelectedReactionService(e.target.value);
                            setSelectedReaction('');
                            setReactionConfig({});
                          }}
                          className="w-full px-4 py-3 bg-purple-50/50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 appearance-none"
                        >
                          <option value="">Choisir un service</option>
                          {services
                            .filter((s) => s.reactions.length > 0)
                            .map((service) => (
                              <option key={service.name} value={service.name}>
                                {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                              </option>
                            ))}
                        </select>
                        {selectedReactionService && (
                          <div
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 ${serviceColors[selectedReactionService]?.bg || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white`}
                          >
                            {serviceIcons[selectedReactionService] || <Zap className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.div
                      className={!selectedReactionService ? 'opacity-50 pointer-events-none' : ''}
                      animate={{ opacity: selectedReactionService ? 1 : 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-text mb-2">
                        Action à exécuter <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!selectedReactionService}
                        value={selectedReaction}
                        onChange={(e) => {
                          setSelectedReaction(e.target.value);
                          setReactionConfig({});
                        }}
                        className="w-full px-4 py-3 bg-purple-50/50 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >
                        <option value="">Choisir une action</option>
                        {getServiceReactions().map((reaction) => (
                          <option key={reaction.name} value={reaction.name}>
                            {reaction.description}
                          </option>
                        ))}
                      </select>
                    </motion.div>

                    <AnimatePresence>
                      {selectedReaction && getSelectedReactionConfig().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-5 border-t-2 border-purple-100"
                        >
                          <h4 className="font-semibold text-sm text-purple-600 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configuration
                          </h4>
                          <div className="space-y-4">
                            {getSelectedReactionConfig().map((field) => (
                              <div key={field.name}>
                                <label className="block text-sm font-semibold text-text mb-2">
                                  {field.label}{' '}
                                  {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {renderConfigField(
                                  field,
                                  reactionConfig[field.name] as
                                    | string
                                    | number
                                    | boolean
                                    | undefined,
                                  handleReactionConfigChange,
                                  'purple'
                                )}
                                {field.description && (
                                  <p className="text-xs text-gray-500 mt-1.5">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-end gap-4 pt-4"
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/areas')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 border-2 border-secondary text-text rounded-xl hover:bg-secondary/10 transition-all duration-200 font-semibold"
                >
                  Annuler
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!isFormValid || creating}
                  whileHover={isFormValid && !creating ? { scale: 1.02 } : {}}
                  whileTap={isFormValid && !creating ? { scale: 0.98 } : {}}
                  className={`px-10 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isFormValid || creating
                      ? 'bg-secondary cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30'
                  }`}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Créer l'AREA
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
