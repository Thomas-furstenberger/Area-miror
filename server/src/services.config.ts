export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'url' | 'time' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface ActionConfig {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

export interface ReactionConfig {
  name: string;
  description: string;
  configFields?: ConfigField[];
}

export interface ServiceConfig {
  name: string;
  actions: ActionConfig[];
  reactions: ReactionConfig[];
}

export const SERVICES: ServiceConfig[] = [
  {
    name: 'github',
    actions: [
      {
        name: 'new_commit',
        description: 'Nouveau commit sur un dépôt',
        configFields: [
          {
            name: 'repo_owner',
            label: 'Propriétaire du dépôt',
            type: 'text',
            placeholder: 'ex: facebook',
            required: true,
            description: "Nom de l'utilisateur ou de l'organisation",
          },
          {
            name: 'repo_name',
            label: 'Nom du dépôt',
            type: 'text',
            placeholder: 'ex: react',
            required: true,
            description: 'Nom exact du dépôt',
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'create_issue',
        description: 'Créer une nouvelle issue',
        configFields: [
          {
            name: 'repo_owner',
            label: 'Propriétaire du dépôt',
            type: 'text',
            placeholder: 'ex: facebook',
            required: true,
          },
          {
            name: 'repo_name',
            label: 'Nom du dépôt',
            type: 'text',
            placeholder: 'ex: react',
            required: true,
          },
          {
            name: 'title',
            label: "Titre de l'issue",
            type: 'text',
            placeholder: 'Rapport de bug...',
            required: true,
          },
          {
            name: 'body',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Détails du problème...',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'timer',
    actions: [
      {
        name: 'time_reached',
        description: 'Quand une heure précise est atteinte',
        configFields: [
          {
            name: 'time',
            label: 'Heure',
            type: 'time',
            placeholder: '14:30',
            required: true,
            description: 'Heure à laquelle déclencher (format 24h)',
          },
        ],
      },
      {
        name: 'date_reached',
        description: 'Quand une date précise est atteinte',
        configFields: [
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            required: true,
            description: 'Date à laquelle déclencher',
          },
        ],
      },
      {
        name: 'day_of_week',
        description: 'Quand un jour spécifique de la semaine est atteint',
        configFields: [
          {
            name: 'day',
            label: 'Jour de la semaine',
            type: 'select',
            required: true,
            options: [
              { value: '1', label: 'Lundi' },
              { value: '2', label: 'Mardi' },
              { value: '3', label: 'Mercredi' },
              { value: '4', label: 'Jeudi' },
              { value: '5', label: 'Vendredi' },
              { value: '6', label: 'Samedi' },
              { value: '0', label: 'Dimanche' },
            ],
          },
          {
            name: 'time',
            label: 'Heure (optionnel)',
            type: 'time',
            placeholder: '09:00',
            required: false,
          },
        ],
      },
    ],
    reactions: [],
  },
  {
    name: 'gmail',
    actions: [
      {
        name: 'email_received',
        description: 'Un nouvel email est reçu',
        configFields: [
          {
            name: 'from',
            label: 'Email expéditeur (optionnel)',
            type: 'email',
            placeholder: 'exemple@email.com',
            required: false,
            description: 'Filtrer par adresse email spécifique',
          },
          {
            name: 'subject',
            label: 'Mot-clé dans le sujet (optionnel)',
            type: 'text',
            placeholder: 'urgent, facture...',
            required: false,
            description: 'Filtrer par mot-clé dans le sujet',
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'send_email',
        description: 'Envoyer un email à un destinataire',
        configFields: [
          {
            name: 'to',
            label: 'Destinataire',
            type: 'email',
            placeholder: 'destinataire@example.com',
            required: true,
          },
          {
            name: 'subject',
            label: 'Sujet',
            type: 'text',
            placeholder: "Sujet de l'email",
            required: true,
          },
          {
            name: 'body',
            label: 'Corps du message',
            type: 'textarea',
            placeholder: "Contenu de l'email...",
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'discord',
    actions: [],
    reactions: [
      {
        name: 'send_message',
        description: 'Envoyer un message sur un canal Discord',
        configFields: [
          {
            name: 'webhookUrl',
            label: 'URL du Webhook Discord',
            type: 'url',
            placeholder: 'https://discord.com/api/webhooks/...',
            required: true,
            description: 'URL du webhook Discord (Paramètres > Intégrations > Webhooks)',
          },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea',
            placeholder: 'Contenu du message...',
            required: true,
          },
          {
            name: 'username',
            label: 'Nom du bot (optionnel)',
            type: 'text',
            placeholder: 'AREA Bot',
            required: false,
          },
        ],
      },
    ],
  },
];
