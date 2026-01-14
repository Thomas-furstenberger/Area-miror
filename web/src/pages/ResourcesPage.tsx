import { motion } from 'framer-motion';
import {
  BookOpen,
  Video,
  FileText,
  Code,
  Users,
  MessageCircle,
  ArrowRight,
  Play,
  Download,
  Clock,
  Star,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
  { id: 'all', name: 'Tout', icon: BookOpen },
  { id: 'guides', name: 'Guides', icon: FileText },
  { id: 'tutorials', name: 'Tutoriels', icon: Video },
  { id: 'api', name: 'API', icon: Code },
  { id: 'community', name: 'Communauté', icon: Users },
];

const resources = [
  {
    id: 1,
    title: 'Guide de démarrage rapide',
    description: "Apprenez les bases d'AREA en 10 minutes et créez votre première automatisation.",
    category: 'guides',
    type: 'Article',
    readTime: '10 min',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    popular: true,
  },
  {
    id: 2,
    title: 'Automatiser GitHub + Discord',
    description:
      'Recevez des notifications Discord pour chaque pull request et issue sur vos repos.',
    category: 'tutorials',
    type: 'Tutoriel vidéo',
    readTime: '15 min',
    image:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60',
    popular: true,
  },
  {
    id: 3,
    title: 'Documentation API REST',
    description: 'Référence complète de notre API pour intégrer AREA dans vos applications.',
    category: 'api',
    type: 'Documentation',
    readTime: '30 min',
    image:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    popular: false,
  },
  {
    id: 4,
    title: 'Webhooks avancés',
    description: 'Maîtrisez les webhooks pour créer des automatisations personnalisées.',
    category: 'api',
    type: 'Guide technique',
    readTime: '20 min',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
    popular: false,
  },
  {
    id: 5,
    title: 'Gérer vos emails avec Gmail',
    description: 'Automatisez le tri, les réponses et les notifications de vos emails.',
    category: 'tutorials',
    type: 'Tutoriel vidéo',
    readTime: '12 min',
    image:
      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=60',
    popular: true,
  },
  {
    id: 6,
    title: 'Bonnes pratiques de sécurité',
    description: 'Sécurisez vos automatisations et protégez vos données sensibles.',
    category: 'guides',
    type: 'Article',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    popular: false,
  },
  {
    id: 7,
    title: 'Forum de la communauté',
    description: "Posez vos questions, partagez vos Areas et échangez avec d'autres utilisateurs.",
    category: 'community',
    type: 'Forum',
    readTime: '',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60',
    popular: false,
  },
  {
    id: 8,
    title: "Templates d'Areas populaires",
    description: "Découvrez et importez des automatisations prêtes à l'emploi.",
    category: 'guides',
    type: 'Galerie',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
    popular: true,
  },
  {
    id: 9,
    title: 'SDK JavaScript',
    description: 'Intégrez AREA dans vos applications Node.js avec notre SDK officiel.',
    category: 'api',
    type: 'Documentation',
    readTime: '25 min',
    image:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60',
    popular: false,
  },
];

const videoTutorials = [
  {
    title: 'Créer sa première Area en 5 minutes',
    duration: '5:32',
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=60',
    views: '12.4k',
  },
  {
    title: 'Intégration Slack complète',
    duration: '18:45',
    thumbnail:
      'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&auto=format&fit=crop&q=60',
    views: '8.2k',
  },
  {
    title: 'Automatiser son workflow DevOps',
    duration: '24:10',
    thumbnail:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&auto=format&fit=crop&q=60',
    views: '6.8k',
  },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="container mx-auto px-6 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Centre de ressources</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-text mb-6"
          >
            Apprenez à{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              maîtriser AREA
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text/60 max-w-2xl mx-auto mb-10"
          >
            Guides, tutoriels, documentation et communauté pour vous aider à tirer le meilleur parti
            de vos automatisations.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Rechercher des ressources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </motion.div>
        </section>

        {/* Quick Links */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: FileText, label: 'Documentation', href: '/docs', color: 'bg-blue-500' },
              { icon: Video, label: 'Tutoriels vidéo', href: '/tutorials', color: 'bg-red-500' },
              { icon: Code, label: 'API Reference', href: '/api', color: 'bg-green-500' },
              { icon: MessageCircle, label: 'Support', href: '/support', color: 'bg-purple-500' },
            ].map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}
                >
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-text">{link.label}</span>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-text/70 border border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Resources Grid */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredResources.map((resource, index) => (
              <motion.article
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {resource.popular && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 rounded-full">
                      <Star className="w-3 h-3 text-yellow-900" fill="currentColor" />
                      <span className="text-xs font-semibold text-yellow-900">Populaire</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-medium text-text">{resource.type}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-text mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-text/60 text-sm mb-4 line-clamp-2">{resource.description}</p>
                  {resource.readTime && (
                    <div className="flex items-center gap-1 text-text/40 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{resource.readTime} de lecture</span>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text/70 text-lg">Aucune ressource trouvée pour cette recherche.</p>
            </div>
          )}
        </section>

        {/* Video Tutorials Section */}
        <section className="container mx-auto px-6 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-text mb-2">Tutoriels vidéo</h2>
                <p className="text-text/60">Apprenez visuellement avec nos vidéos pas-à-pas</p>
              </div>
              <Link
                to="/tutorials"
                className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline"
              >
                Voir tous les tutoriels
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {videoTutorials.map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={225}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-sm font-medium rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h3 className="font-semibold text-text group-hover:text-primary transition-colors mb-1">
                    {video.title}
                  </h3>
                  <p className="text-text/70 text-sm">{video.views} vues</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Contribute Section */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
                  Comment contribuer ?
                </h2>
                <p className="text-text/60 mb-6">
                  Vous souhaitez contribuer au projet AREA ? Consultez notre guide de contribution
                  pour savoir comment participer au développement.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/HOWTOCONTRIBUTE.md"
                    download="HOWTOCONTRIBUTE.md"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 hover:shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le guide
                  </a>
                </div>
              </div>
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Code className="w-16 h-16 text-primary" />
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
