import { Workflow, Plug, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Plug,
      title: 'Connect Your Services',
      description:
        'Link your favorite apps and services with just a few clicks. We support hundreds of integrations.',
    },
    {
      icon: Workflow,
      title: 'Create Automation Rules',
      description:
        'Define triggers (actions) and reactions. Set up complex workflows with our intuitive interface.',
    },
    {
      icon: Rocket,
      title: 'Sit Back & Relax',
      description:
        'Let AREA handle the rest. Your automations run 24/7 in the background, saving you time.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-section px-4 sm:px-6 lg:px-8 bg-primary/5"
      aria-labelledby="how-it-works-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-element">
          <h2 id="how-it-works-title" className="text-h2">
            How It Works
          </h2>
          <p className="text-body text-secondary max-w-2xl mx-auto">
            Getting started with AREA is simple. Follow these three steps to automate your workflow.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={index}
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-background hover:shadow-lg transition-shadow"
              >
                {/* Step Number */}
                <div className="relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-background rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Icon size={40} className="text-primary" aria-hidden="true" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-h3 text-xl">{step.title}</h3>
                <p className="text-body text-secondary">{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
