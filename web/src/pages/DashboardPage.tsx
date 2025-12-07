import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getServices, type Service, type Action, type Reaction } from '../services/api';
import { ArrowRight, Plus, Save, Activity, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActionService, setSelectedActionService] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedReactionService, setSelectedReactionService] = useState<string>('');
  const [selectedReaction, setSelectedReaction] = useState<string>('');

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getServices();
      setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleCreateArea = async () => {
    if (!selectedAction || !selectedReaction) return;

    const payload = {
      action: {
        service: selectedActionService,
        event: selectedAction,
      },
      reaction: {
        service: selectedReactionService,
        event: selectedReaction,
      },
    };

    console.log('Payload à envoyer au back:', payload);
    alert('AREA créée (voir console pour le payload)');
  };

  const getServiceDetails = (serviceName: string) => services.find((s) => s.name === serviceName);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">Configurez vos automatisations Action-Réaction.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">Chargement des services...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
                <div className="space-y-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="text-blue-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">ACTION (Si ceci...)</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      value={selectedActionService}
                      onChange={(e) => {
                        setSelectedActionService(e.target.value);
                        setSelectedAction('');
                      }}
                    >
                      <option value="">Sélectionner un service</option>
                      {services
                        .filter((s) => s.actions.length > 0)
                        .map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div
                    className={`transition-opacity duration-200 ${!selectedActionService ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Déclencheur
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      disabled={!selectedActionService}
                    >
                      <option value="">Sélectionner un déclencheur</option>
                      {selectedActionService &&
                        getServiceDetails(selectedActionService)?.actions.map((action) => (
                          <option key={action.name} value={action.name}>
                            {action.description}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md border border-gray-200 text-gray-400">
                  <ArrowRight size={24} />
                </div>

                <div className="space-y-6 bg-purple-50/50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="text-purple-600" size={24} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      RÉACTION (Alors cela...)
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                      value={selectedReactionService}
                      onChange={(e) => {
                        setSelectedReactionService(e.target.value);
                        setSelectedReaction('');
                      }}
                    >
                      <option value="">Sélectionner un service</option>
                      {services
                        .filter((s) => s.reactions.length > 0)
                        .map((service) => (
                          <option key={service.name} value={service.name}>
                            {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div
                    className={`transition-opacity duration-200 ${!selectedReactionService ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action à effectuer
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      value={selectedReaction}
                      onChange={(e) => setSelectedReaction(e.target.value)}
                      disabled={!selectedReactionService}
                    >
                      <option value="">Sélectionner une action</option>
                      {selectedReactionService &&
                        getServiceDetails(selectedReactionService)?.reactions.map((reaction) => (
                          <option key={reaction.name} value={reaction.name}>
                            {reaction.description}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleCreateArea}
                  disabled={!selectedAction || !selectedReaction}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all transform hover:scale-105
                    ${
                      !selectedAction || !selectedReaction
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                    }`}
                >
                  <Save size={20} />
                  Créer l'AREA
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
