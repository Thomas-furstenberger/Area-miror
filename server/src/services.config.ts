export interface ActionConfig {
  name: string;
  description: string;
}

export interface ReactionConfig {
  name: string;
  description: string;
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
      },
      {
        name: 'pull_request_opened',
        description: 'A new pull request is opened',
      },
      {
        name: 'repository_starred',
        description: 'Your repository gets a star',
      },
    ],
    reactions: [
      {
        name: 'create_issue',
        description: 'Create a new issue on a repository',
      },
      {
        name: 'post_comment',
        description: 'Post a comment on an issue or pull request',
      },
    ],
  },
  {
    name: 'timer',
    actions: [
      {
        name: 'time_reached',
        description: 'When a specific time is reached during the day',
      },
      {
        name: 'date_reached',
        description: 'When a specific date is reached',
      },
      {
        name: 'day_of_week',
        description: 'When a specific day of the week is reached',
      },
    ],
    reactions: [
      {
        name: 'send_notification',
        description: 'Send a notification to the user',
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
      },
      {
        name: 'email_with_attachment',
        description: 'An email is received with an attachment',
      },
      {
        name: 'email_from_contact',
        description: 'An email is received from a specific contact',
      },
    ],
    reactions: [
      {
        name: 'send_email',
        description: 'Send an email to a recipient',
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
      },
      {
        name: 'send_dm',
        description: 'Send a direct message to a user',
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
