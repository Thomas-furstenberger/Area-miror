import { motion } from 'framer-motion';
import { Check, X, Zap, Building2, Rocket, HelpCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const plans = [
  {
    name: 'Starter',
    description: 'Parfait pour découvrir AREA et automatiser vos premières tâches',
    price: { monthly: 0, yearly: 0 },
    icon: Zap,
    color: 'from-gray-500 to-gray-600',
    popular: false,
    features: [
      { name: '5 Areas actives', included: true },
      { name: '100 exécutions/mois', included: true },
      { name: '3 intégrations', included: true },
      { name: 'Historique 7 jours', included: true },
      { name: 'Support communautaire', included: true },
      { name: 'Webhooks personnalisés', included: false },
      { name: 'Équipe illimitée', included: false },
      { name: 'Support prioritaire', included: false },
      { name: 'API avancée', included: false },
      { name: 'SSO / SAML', included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaLink: '/register',
  },
  {
    name: 'Pro',
    description: 'Pour les professionnels qui veulent booster leur productivité',
    price: { monthly: 19, yearly: 15 },
    icon: Rocket,
    color: 'from-primary to-primary/70',
    popular: true,
    features: [
      { name: 'Areas illimitées', included: true },
      { name: '10 000 exécutions/mois', included: true },
      { name: 'Toutes les intégrations', included: true },
      { name: 'Historique 30 jours', included: true },
      { name: 'Support email prioritaire', included: true },
      { name: 'Webhooks personnalisés', included: true },
      { name: "Jusqu'à 5 membres", included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'API avancée', included: false },
      { name: 'SSO / SAML', included: false },
    ],
    cta: 'Essai gratuit 14 jours',
    ctaLink: '/register?plan=pro',
  },
  {
    name: 'Business',
    description: 'Pour les équipes qui ont besoin de puissance et de contrôle',
    price: { monthly: 49, yearly: 39 },
    icon: Building2,
    color: 'from-secondary to-secondary/70',
    popular: false,
    features: [
      { name: 'Areas illimitées', included: true },
      { name: 'Exécutions illimitées', included: true },
      { name: 'Toutes les intégrations', included: true },
      { name: 'Historique illimité', included: true },
      { name: 'Support dédié 24/7', included: true },
      { name: 'Webhooks personnalisés', included: true },
      { name: 'Équipe illimitée', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'API avancée', included: true },
      { name: 'SSO / SAML', included: true },
    ],
    cta: 'Contacter les ventes',
    ctaLink: '/contact',
  },
];

const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous ajustons votre facturation au prorata.',
  },
  {
    question: 'Qu\'est-ce qu\'une "exécution" ?',
    answer:
      "Une exécution correspond à chaque fois qu'une Area est déclenchée et effectue ses actions. Par exemple, si vous avez une Area qui envoie un message Discord quand vous recevez un email, chaque email traité compte comme une exécution.",
  },
  {
    question: 'Y a-t-il un engagement de durée ?',
    answer:
      'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment. Pour les plans annuels, nous remboursons au prorata la période non utilisée.',
  },
  {
    question: 'Proposez-vous des réductions pour les startups ou associations ?',
    answer:
      'Oui ! Nous offrons 50% de réduction aux startups early-stage et aux associations à but non lucratif. Contactez-nous avec les justificatifs appropriés.',
  },
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "L'essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités du plan Pro, sans carte bancaire requise. À la fin de l'essai, vous pouvez choisir de continuer ou de passer au plan gratuit.",
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Nous utilisons un chiffrement AES-256 pour toutes les données au repos et TLS 1.3 pour les données en transit. Nous sommes conformes au RGPD et hébergés sur des serveurs européens.',
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <span className="text-sm font-medium text-primary">
              Tarification simple et transparente
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-text mb-6"
          >
            Choisissez le plan adapté à{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              vos besoins
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text/60 max-w-2xl mx-auto mb-10"
          >
            Commencez gratuitement, évoluez à votre rythme. Pas de surprises, pas de frais cachés.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${!isYearly ? 'text-text' : 'text-text/50'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: isYearly ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-text' : 'text-text/50'}`}>
              Annuel
            </span>
            {isYearly && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                -20%
              </span>
            )}
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-white border-2 border-primary shadow-xl shadow-primary/10'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                    Plus populaire
                  </div>
                )}

                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}
                >
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-text mb-2">{plan.name}</h3>
                <p className="text-text/60 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-text">
                    {plan.price.monthly === 0
                      ? 'Gratuit'
                      : `${isYearly ? plan.price.yearly : plan.price.monthly}€`}
                  </span>
                  {plan.price.monthly > 0 && <span className="text-text/50 ml-2">/mois</span>}
                  {plan.price.monthly > 0 && isYearly && (
                    <p className="text-sm text-text/40 mt-1">
                      Facturé {plan.price.yearly * 12}€/an
                    </p>
                  )}
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all mb-8 ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
                      : 'bg-text/5 text-text hover:bg-text/10'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-text' : 'text-text/40'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-text to-text/90 rounded-3xl p-10 md:p-16 text-center"
          >
            <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Besoin d'une solution entreprise ?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Déploiement on-premise, SLA personnalisé, intégrations sur mesure, formation de vos
              équipes... Parlons de vos besoins spécifiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Contacter l'équipe commerciale
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="/docs/enterprise"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Voir la documentation
              </a>
            </div>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Questions fréquentes
              </h2>
              <p className="text-text/60">
                Vous avez d'autres questions ?{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  Contactez-nous
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * index }}
                  className="border border-gray-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-text pr-4">{faq.question}</span>
                    <HelpCircle
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-text/70">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
