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
      {
        name: 'new_issue',
        description: 'Nouvelle issue créée sur un dépôt',
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
        ],
      },
      {
        name: 'new_star',
        description: 'Nouveau star reçu sur un dépôt',
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
      {
        name: 'add_comment',
        description: 'Ajouter un commentaire sur une issue',
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
            name: 'issue_number',
            label: "Numéro de l'issue",
            type: 'number',
            placeholder: '42',
            required: true,
          },
          {
            name: 'comment',
            label: 'Commentaire',
            type: 'textarea',
            placeholder: 'Votre commentaire...',
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
      {
        name: 'mark_as_read',
        description: 'Marquer un email comme lu',
        configFields: [
          {
            name: 'from',
            label: 'Email expéditeur (optionnel)',
            type: 'email',
            placeholder: 'exemple@email.com',
            required: false,
            description: 'Marquer comme lu les emails de cet expéditeur',
          },
        ],
      },
    ],
  },
  {
    name: 'discord',
    actions: [
      {
        name: 'message_received',
        description: 'Un message est reçu sur un webhook Discord',
        configFields: [
          {
            name: 'webhook_url',
            label: 'URL du Webhook Discord',
            type: 'url',
            placeholder: 'https://discord.com/api/webhooks/...',
            required: true,
            description: 'URL du webhook à surveiller',
          },
          {
            name: 'keyword',
            label: 'Mot-clé à détecter (optionnel)',
            type: 'text',
            placeholder: 'urgent, important...',
            required: false,
            description: 'Filtrer les messages contenant ce mot-clé',
          },
        ],
      },
      {
        name: 'user_joined',
        description: 'Un utilisateur rejoint le serveur Discord',
        configFields: [
          {
            name: 'webhook_url',
            label: 'URL du Webhook Discord',
            type: 'url',
            placeholder: 'https://discord.com/api/webhooks/...',
            required: true,
            description: 'URL du webhook configuré sur le serveur',
          },
        ],
      },
    ],
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
  {
    name: 'youtube',
    actions: [
      {
        name: 'new_video',
        description: 'Nouvelle vidéo sur une chaîne YouTube',
        configFields: [
          {
            name: 'channel_url',
            label: 'Lien de la chaîne YouTube',
            type: 'url',
            placeholder: 'https://www.youtube.com/@Squeezie',
            required: true,
            description: "L'URL complète de la chaîne ou le Handle (@...)",
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'add_to_playlist',
        description: 'Ajouter une vidéo à une playlist YouTube',
        configFields: [
          {
            name: 'video_url',
            label: 'URL de la vidéo',
            type: 'url',
            placeholder: 'https://www.youtube.com/watch?v=...',
            required: true,
            description: 'URL complète de la vidéo YouTube',
          },
          {
            name: 'playlist_id',
            label: 'ID de la playlist',
            type: 'text',
            placeholder: 'PLxxx...',
            required: true,
            description: 'ID de la playlist YouTube',
          },
        ],
      },
    ],
  },
  {
    name: 'weather',
    actions: [
      {
        name: 'temperature_above',
        description: 'La température dépasse un seuil',
        configFields: [
          {
            name: 'city',
            label: 'Ville',
            type: 'text',
            placeholder: 'Paris',
            required: true,
            description: 'Nom de la ville à surveiller',
          },
          {
            name: 'temperature',
            label: 'Température (°C)',
            type: 'number',
            placeholder: '25',
            required: true,
            description: 'Seuil de température en degrés Celsius',
          },
        ],
      },
      {
        name: 'temperature_below',
        description: "La température passe en dessous d'un seuil",
        configFields: [
          {
            name: 'city',
            label: 'Ville',
            type: 'text',
            placeholder: 'Paris',
            required: true,
            description: 'Nom de la ville à surveiller',
          },
          {
            name: 'temperature',
            label: 'Température (°C)',
            type: 'number',
            placeholder: '10',
            required: true,
            description: 'Seuil de température en degrés Celsius',
          },
        ],
      },
      {
        name: 'weather_condition',
        description: 'Une condition météo spécifique est détectée',
        configFields: [
          {
            name: 'city',
            label: 'Ville',
            type: 'text',
            placeholder: 'Paris',
            required: true,
            description: 'Nom de la ville à surveiller',
          },
          {
            name: 'condition',
            label: 'Condition météo',
            type: 'select',
            required: true,
            options: [
              { value: 'clear', label: 'Ciel dégagé' },
              { value: 'clouds', label: 'Nuageux' },
              { value: 'rain', label: 'Pluie' },
              { value: 'snow', label: 'Neige' },
              { value: 'thunderstorm', label: 'Orage' },
              { value: 'drizzle', label: 'Bruine' },
              { value: 'mist', label: 'Brouillard' },
            ],
            description: 'Type de condition météorologique',
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'send_weather_info',
        description: "Envoyer les informations météo détaillées d'une ville",
        configFields: [
          {
            name: 'city',
            label: 'Ville',
            type: 'text',
            placeholder: 'Paris',
            required: true,
            description: 'Nom de la ville pour laquelle obtenir la météo',
          },
          {
            name: 'destination',
            label: 'Destination',
            type: 'select',
            required: true,
            options: [
              { value: 'discord', label: 'Discord' },
              { value: 'gmail', label: 'Email' },
            ],
            description: 'Où envoyer les informations météo',
          },
          {
            name: 'discord_webhook',
            label: 'Webhook Discord (si Discord)',
            type: 'url',
            placeholder: 'https://discord.com/api/webhooks/...',
            required: false,
            description: 'URL du webhook Discord (requis si destination = Discord)',
          },
          {
            name: 'email_to',
            label: 'Email destinataire (si Email)',
            type: 'email',
            placeholder: 'user@example.com',
            required: false,
            description: 'Adresse email du destinataire (requis si destination = Email)',
          },
        ],
      },
    ],
  },
];
