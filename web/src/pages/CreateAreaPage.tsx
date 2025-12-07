import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Zap, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';

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

const API_URL = 'http://localhost:3000';

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
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});
  const [selectedReactionService, setSelectedReactionService] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [reactionConfig, setReactionConfig] = useState<Record<string, any>>({});

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
          actionConfig: actionConfig,
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
      }, 1500);
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

  const handleActionConfigChange = (fieldName: string, value: any) => {
    setActionConfig({ ...actionConfig, [fieldName]: value });
  };

  const handleReactionConfigChange = (fieldName: string, value: any) => {
    setReactionConfig({ ...reactionConfig, [fieldName]: value });
  };

  const renderConfigField = (
    field: ConfigField,
    value: any,
    onChange: (name: string, value: any) => void
  ) => {
    const baseClasses =
      'w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-colors';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            required={field.required}
            value={value || ''}
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
            value={value || ''}
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
            value={value || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
    }
  };

  const isFormValid = areaName && selectedAction && selectedReaction;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text mb-3">Créer une nouvelle AREA</h1>
          <p className="text-lg text-secondary">
            Connectez une action à une réaction pour automatiser vos tâches
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-secondary">Chargement des services...</p>
          </div>
        ) : success ? (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center">
            <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">AREA créée avec succès !</h2>
            <p className="text-green-700">Redirection vers vos AREAs...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-secondary/30">
              <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
                <Zap className="text-primary" />
                Informations de l'AREA
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Nom de l'AREA *
                  </label>
                  <input
                    type="text"
                    required
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="Mon automatisation"
                    className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={areaDescription}
                    onChange={(e) => setAreaDescription(e.target.value)}
                    placeholder="Décrivez votre automatisation..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-white p-3 rounded-full shadow-lg border-2 border-primary">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-text">SI (Action)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Service déclencheur *
                    </label>
                    <select
                      required
                      value={selectedActionService}
                      onChange={(e) => {
                        setSelectedActionService(e.target.value);
                        setSelectedAction('');
                        setActionConfig({});
                      }}
                      className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
                    >
                      <option value="">Choisir un service</option>
                      {services
                        .filter((s) => s.actions.length > 0)
                        .map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={!selectedActionService ? 'opacity-50' : ''}>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Événement déclencheur *
                    </label>
                    <select
                      required
                      disabled={!selectedActionService}
                      value={selectedAction}
                      onChange={(e) => {
                        setSelectedAction(e.target.value);
                        setActionConfig({});
                      }}
                      className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white disabled:cursor-not-allowed"
                    >
                      <option value="">Choisir un événement</option>
                      {getServiceActions().map((action) => (
                        <option key={action.name} value={action.name}>
                          {action.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedAction && getSelectedActionConfig().length > 0 && (
                    <div className="pt-4 border-t-2 border-blue-100">
                      <h4 className="font-semibold text-sm text-blue-700 mb-3">⚙️ Configuration</h4>
                      <div className="space-y-4">
                        {getSelectedActionConfig().map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-semibold text-text mb-2">
                              {field.label} {field.required && '*'}
                            </label>
                            {renderConfigField(
                              field,
                              actionConfig[field.name],
                              handleActionConfigChange
                            )}
                            {field.description && (
                              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-text">ALORS (Réaction)</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Service de réaction *
                    </label>
                    <select
                      required
                      value={selectedReactionService}
                      onChange={(e) => {
                        setSelectedReactionService(e.target.value);
                        setSelectedReaction('');
                        setReactionConfig({});
                      }}
                      className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-purple-500 focus:outline-none transition-colors bg-white"
                    >
                      <option value="">Choisir un service</option>
                      {services
                        .filter((s) => s.reactions.length > 0)
                        .map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={!selectedReactionService ? 'opacity-50' : ''}>
                    <label className="block text-sm font-semibold text-text mb-2">
                      Action à exécuter *
                    </label>
                    <select
                      required
                      disabled={!selectedReactionService}
                      value={selectedReaction}
                      onChange={(e) => {
                        setSelectedReaction(e.target.value);
                        setReactionConfig({});
                      }}
                      className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:border-purple-500 focus:outline-none transition-colors bg-white disabled:cursor-not-allowed"
                    >
                      <option value="">Choisir une action</option>
                      {getServiceReactions().map((reaction) => (
                        <option key={reaction.name} value={reaction.name}>
                          {reaction.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedReaction && getSelectedReactionConfig().length > 0 && (
                    <div className="pt-4 border-t-2 border-purple-100">
                      <h4 className="font-semibold text-sm text-purple-700 mb-3">
                        ⚙️ Configuration
                      </h4>
                      <div className="space-y-4">
                        {getSelectedReactionConfig().map((field) => (
                          <div key={field.name}>
                            <label className="block text-sm font-semibold text-text mb-2">
                              {field.label} {field.required && '*'}
                            </label>
                            {renderConfigField(
                              field,
                              reactionConfig[field.name],
                              handleReactionConfigChange
                            )}
                            {field.description && (
                              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/areas')}
                className="px-6 py-3 border-2 border-secondary text-text rounded-lg hover:bg-secondary/10 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isFormValid || creating}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 ${
                  !isFormValid || creating
                    ? 'bg-secondary cursor-not-allowed opacity-50'
                    : 'bg-primary hover:opacity-90 shadow-lg'
                }`}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Créer l'AREA
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
