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
        name: 'issue_created',
        description: 'A new issue is created on a repository',
        configFields: [
          {
            name: 'repository',
            label: 'Repository',
            type: 'text',
            placeholder: 'owner/repo',
            required: true,
            description: 'Format: propriétaire/nom-du-repo',
          },
        ],
      },
      {
        name: 'pull_request_opened',
        description: 'A new pull request is opened',
        configFields: [
          {
            name: 'repository',
            label: 'Repository',
            type: 'text',
            placeholder: 'owner/repo',
            required: true,
          },
        ],
      },
      {
        name: 'repository_starred',
        description: 'Your repository gets a star',
        configFields: [
          {
            name: 'repository',
            label: 'Repository',
            type: 'text',
            placeholder: 'owner/repo',
            required: true,
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'create_issue',
        description: 'Create a new issue on a repository',
        configFields: [
          {
            name: 'repository',
            label: 'Repository',
            type: 'text',
            placeholder: 'owner/repo',
            required: true,
          },
          {
            name: 'title',
            label: "Titre de l'issue",
            type: 'text',
            placeholder: 'Bug report',
            required: true,
          },
          {
            name: 'body',
            label: 'Description',
            type: 'textarea',
            placeholder: "Décrivez l'issue...",
            required: false,
          },
        ],
      },
      {
        name: 'post_comment',
        description: 'Post a comment on an issue or pull request',
        configFields: [
          {
            name: 'repository',
            label: 'Repository',
            type: 'text',
            placeholder: 'owner/repo',
            required: true,
          },
          {
            name: 'issueNumber',
            label: "Numéro de l'issue/PR",
            type: 'number',
            placeholder: '123',
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
        description: 'When a specific time is reached during the day',
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
        description: 'When a specific date is reached',
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
        description: 'When a specific day of the week is reached',
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
    reactions: [
      {
        name: 'send_notification',
        description: 'Send a notification to the user',
        configFields: [
          {
            name: 'title',
            label: 'Titre',
            type: 'text',
            placeholder: 'Notification AREA',
            required: true,
          },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea',
            placeholder: 'Contenu de la notification...',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'google_drive',
    actions: [
      {
        name: 'file_created',
        description: 'A new file is created in Google Drive',
      },
      {
        name: 'file_shared',
        description: 'A file is shared with you',
      },
      {
        name: 'folder_created',
        description: 'A new folder is created in Google Drive',
      },
    ],
    reactions: [
      {
        name: 'create_file',
        description: 'Create a new file in Google Drive',
      },
      {
        name: 'create_folder',
        description: 'Create a new folder in Google Drive',
      },
    ],
  },
  {
    name: 'gmail',
    actions: [
      {
        name: 'email_received',
        description: 'A new email is received',
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
      {
        name: 'email_with_attachment',
        description: 'An email is received with an attachment',
      },
      {
        name: 'email_from_contact',
        description: 'An email is received from a specific contact',
        configFields: [
          {
            name: 'email',
            label: 'Adresse email du contact',
            type: 'email',
            placeholder: 'contact@example.com',
            required: true,
          },
        ],
      },
    ],
    reactions: [
      {
        name: 'send_email',
        description: 'Send an email to a recipient',
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
        name: 'star_email',
        description: 'Star an email in Gmail',
      },
    ],
  },
  {
    name: 'discord',
    actions: [
      {
        name: 'message_received',
        description: 'A message is received in a Discord channel',
        configFields: [
          {
            name: 'channelId',
            label: 'Channel ID (optionnel)',
            type: 'text',
            placeholder: '123456789012345678',
            required: false,
            description: 'ID du channel Discord à surveiller',
          },
          {
            name: 'keyword',
            label: 'Mot-clé (optionnel)',
            type: 'text',
            placeholder: 'urgent, help...',
            required: false,
            description: 'Déclencheur uniquement si le message contient ce mot',
          },
        ],
      },
      {
        name: 'user_joined',
        description: 'A user joins the Discord server',
      },
    ],
    reactions: [
      {
        name: 'send_message',
        description: 'Send a message to a Discord channel',
        configFields: [
          {
            name: 'webhookUrl',
            label: 'Webhook URL Discord',
            type: 'url',
            placeholder: 'https://discord.com/api/webhooks/...',
            required: true,
            description: 'URL du webhook Discord (Settings > Integrations > Webhooks)',
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
      {
        name: 'send_dm',
        description: 'Send a direct message to a user',
        configFields: [
          {
            name: 'userId',
            label: 'User ID Discord',
            type: 'text',
            placeholder: '123456789012345678',
            required: true,
          },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea',
            placeholder: 'Contenu du message...',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'notion',
    actions: [
      {
        name: 'page_created',
        description: 'A new page is created in Notion',
      },
      {
        name: 'database_entry_added',
        description: 'A new entry is added to a Notion database',
      },
    ],
    reactions: [
      {
        name: 'create_page',
        description: 'Create a new page in Notion',
      },
      {
        name: 'add_database_entry',
        description: 'Add a new entry to a Notion database',
      },
    ],
  },
];
