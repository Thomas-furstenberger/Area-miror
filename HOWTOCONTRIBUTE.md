# How to Contribute to AREA

This guide explains how to extend the AREA platform by adding new services, actions, and reactions.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Adding a New Service](#adding-a-new-service)
- [Adding a New Action](#adding-a-new-action)
- [Adding a New Reaction](#adding-a-new-reaction)
- [Testing Your Changes](#testing-your-changes)
- [Code Style and Conventions](#code-style-and-conventions)

---

## Architecture Overview

The AREA platform follows a modular architecture:

```
server/src/
├── services.config.ts       # Service definitions (Actions & Reactions config)
├── actions/                 # Action implementations
│   ├── github.action.ts
│   ├── gmail.action.ts
│   └── ...
├── reactions/               # Reaction implementations
│   ├── discord.reaction.ts
│   ├── gmail.reaction.ts
│   └── ...
└── hook.executor.ts         # Orchestrates Actions → Reactions
```

### Key Concepts

- **Service**: A third-party platform (GitHub, Discord, Gmail, etc.)
- **Action**: A trigger condition (e.g., "new email received")
- **Reaction**: An automated response (e.g., "send Discord message")
- **AREA**: A user-defined automation linking one Action to one Reaction
- **Hook Executor**: Background process that checks Actions and triggers Reactions

---

## Adding a New Service

### 1. Create OAuth Configuration (if needed)

If your service requires OAuth authentication:

**Add to `server/src/index.ts`:**

```typescript
// Add OAuth route
fastify.get('/api/auth/myservice', async (request, reply) => {
  const authUrl = `https://api.myservice.com/oauth/authorize?client_id=${process.env.MYSERVICE_CLIENT_ID}&redirect_uri=${process.env.MYSERVICE_CALLBACK_URL}&scope=read,write`;
  return reply.redirect(authUrl);
});

// Add OAuth callback
fastify.get('/api/auth/myservice/callback', async (request, reply) => {
  const { code } = request.query as { code: string };

  // Exchange code for access token
  const tokenResponse = await fetch('https://api.myservice.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.MYSERVICE_CLIENT_ID,
      client_secret: process.env.MYSERVICE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.MYSERVICE_CALLBACK_URL,
    }),
  });

  const { access_token } = await tokenResponse.json();

  // Store token in database
  await prisma.oAuthAccount.upsert({
    where: { userId_provider: { userId: request.user.id, provider: 'MYSERVICE' } },
    create: {
      userId: request.user.id,
      provider: 'MYSERVICE',
      accessToken: access_token,
    },
    update: { accessToken: access_token },
  });

  return reply.redirect(`${process.env.FRONTEND_URL}/services`);
});
```

**Add to `docker-compose.yml`:**

```yaml
environment:
  MYSERVICE_CLIENT_ID: ${MYSERVICE_CLIENT_ID}
  MYSERVICE_CLIENT_SECRET: ${MYSERVICE_CLIENT_SECRET}
  MYSERVICE_CALLBACK_URL: ${MYSERVICE_CALLBACK_URL:-http://localhost:8080/api/auth/myservice/callback}
```

**Add to `.env.example`:**

```bash
MYSERVICE_CLIENT_ID=your_client_id_here
MYSERVICE_CLIENT_SECRET=your_client_secret_here
MYSERVICE_CALLBACK_URL=http://localhost:8080/api/auth/myservice/callback
```

### 2. Register Service in Configuration

**Edit `server/src/services.config.ts`:**

```typescript
export const SERVICES: ServiceConfig[] = [
  // ... existing services
  {
    name: 'myservice',
    actions: [
      // Actions will be added here
    ],
    reactions: [
      // Reactions will be added here
    ],
  },
];
```

---

## Adding a New Action

An Action checks if a condition is met (e.g., new email, new commit, time reached).

### Step 1: Define Action Configuration

**Edit `server/src/services.config.ts`:**

```typescript
{
  name: 'myservice',
  actions: [
    {
      name: 'new_item_created',
      description: 'When a new item is created on MyService',
      configFields: [
        {
          name: 'category',
          label: 'Category to monitor',
          type: 'text',
          placeholder: 'general',
          required: true,
          description: 'The category to watch for new items',
        },
        {
          name: 'keyword',
          label: 'Keyword filter (optional)',
          type: 'text',
          placeholder: 'urgent',
          required: false,
          description: 'Only trigger if item contains this keyword',
        },
      ],
    },
  ],
  // ...
}
```

### Step 2: Implement Action Logic

**Create `server/src/actions/myservice.action.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

export class MyServiceAction {
  constructor(private prisma: PrismaClient) {}

  /**
   * Check if a new item matching the criteria exists
   * @param userId - User ID from the database
   * @param config - Configuration from the AREA (category, keyword, etc.)
   * @param lastTriggered - Last time this action was triggered (null on first run)
   * @returns true if condition is met, false otherwise
   */
  async checkNewItemCreated(
    userId: number,
    config: { category: string; keyword?: string },
    lastTriggered: Date | null
  ): Promise<boolean> {
    try {
      // 1. Get user's OAuth token
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'MYSERVICE' },
      });

      if (!account || !account.accessToken) {
        console.error(`[MyService] No account connected for user ${userId}`);
        return false;
      }

      // 2. Call external API
      const response = await fetch(`https://api.myservice.com/items?category=${config.category}`, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[MyService] API error: ${response.status}`);
        return false;
      }

      const items = await response.json();

      // 3. Find new items since lastTriggered
      const newItems = items.filter((item: any) => {
        const itemDate = new Date(item.created_at);

        // On first run, don't trigger (avoid spam)
        if (!lastTriggered) return false;

        // Check if item is newer than last trigger
        if (itemDate.getTime() <= lastTriggered.getTime()) return false;

        // Apply keyword filter if specified
        if (config.keyword && !item.title.includes(config.keyword)) {
          return false;
        }

        return true;
      });

      // 4. Return true if at least one new item found
      return newItems.length > 0;
    } catch (error) {
      console.error('[MyService Action Error]', error);
      return false;
    }
  }
}
```

### Step 3: Register Action in Hook Executor

**Edit `server/src/hook.executor.ts`:**

```typescript
import { MyServiceAction } from './actions/myservice.action';

export class HookExecutor {
  private myServiceAction: MyServiceAction;

  constructor(private prisma: PrismaClient) {
    // ... existing actions
    this.myServiceAction = new MyServiceAction(prisma);
  }

  private async checkAction(area: Area): Promise<boolean> {
    const config = area.actionConfig as any;

    switch (area.actionService.toLowerCase()) {
      // ... existing cases

      case 'myservice':
        if (area.actionType === 'new_item_created') {
          return await this.myServiceAction.checkNewItemCreated(
            area.userId,
            config,
            area.lastTriggered
          );
        }
        break;
    }

    return false;
  }
}
```

---

## Adding a New Reaction

A Reaction performs an action when triggered (e.g., send message, create issue, send email).

### Step 1: Define Reaction Configuration

**Edit `server/src/services.config.ts`:**

```typescript
{
  name: 'myservice',
  actions: [/* ... */],
  reactions: [
    {
      name: 'create_item',
      description: 'Create a new item on MyService',
      configFields: [
        {
          name: 'title',
          label: 'Item Title',
          type: 'text',
          placeholder: 'New automated item',
          required: true,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Item details...',
          required: true,
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            { value: 'general', label: 'General' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'info', label: 'Information' },
          ],
        },
      ],
    },
  ],
}
```

### Step 2: Implement Reaction Logic

**Create `server/src/reactions/myservice.reaction.ts`:**

```typescript
import { PrismaClient } from '@prisma/client';

export class MyServiceReaction {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new item on MyService
   * @param userId - User ID from the database
   * @param config - Configuration from the AREA (title, description, category)
   * @returns true if successful, false otherwise
   */
  async createItem(
    userId: number,
    config: { title: string; description: string; category: string }
  ): Promise<boolean> {
    try {
      // 1. Get user's OAuth token
      const account = await this.prisma.oAuthAccount.findFirst({
        where: { userId, provider: 'MYSERVICE' },
      });

      if (!account || !account.accessToken) {
        console.error(`[MyService] No account connected for user ${userId}`);
        return false;
      }

      // 2. Call external API to create item
      const response = await fetch('https://api.myservice.com/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: config.title,
          description: config.description,
          category: config.category,
        }),
      });

      if (!response.ok) {
        console.error(`[MyService] Failed to create item: ${response.status}`);
        return false;
      }

      console.log('[MyService] Item created successfully');
      return true;
    } catch (error) {
      console.error('[MyService Reaction Error]', error);
      return false;
    }
  }
}
```

### Step 3: Register Reaction in Hook Executor

**Edit `server/src/hook.executor.ts`:**

```typescript
import { MyServiceReaction } from './reactions/myservice.reaction';

export class HookExecutor {
  private myServiceReaction: MyServiceReaction;

  constructor(private prisma: PrismaClient) {
    // ... existing reactions
    this.myServiceReaction = new MyServiceReaction(prisma);
  }

  private async executeReaction(area: Area): Promise<void> {
    const config = area.reactionConfig as any;

    switch (area.reactionService.toLowerCase()) {
      // ... existing cases

      case 'myservice':
        if (area.reactionType === 'create_item') {
          await this.myServiceReaction.createItem(area.userId, config);
        }
        break;
    }
  }
}
```

---

## Testing Your Changes

### 1. Local Testing

```bash
# Rebuild and restart Docker containers
docker-compose down
docker-compose up --build

# Check logs
docker-compose logs -f server
```

### 2. Test the Flow

1. **Connect Service**: Go to http://localhost:8081/services and connect MyService via OAuth
2. **Create AREA**:
   - Action: MyService - new_item_created
   - Reaction: Discord - send_message (or any other reaction)
3. **Trigger Action**: Create a new item on MyService
4. **Wait**: The Hook Executor runs every 2 minutes
5. **Verify**: Check if the reaction was executed (e.g., Discord message sent)

### 3. Check `/about.json`

Verify your service appears correctly:

```bash
curl http://localhost:8080/about.json | jq
```

Should include your new service with all actions and reactions.

---

## Code Style and Conventions

### TypeScript Best Practices

- Use TypeScript strict mode
- Define interfaces for all configs and responses
- Use `async/await` instead of `.then()`
- Always handle errors with try-catch

### Naming Conventions

- **Files**: `service.action.ts`, `service.reaction.ts` (lowercase)
- **Classes**: `ServiceAction`, `ServiceReaction` (PascalCase)
- **Methods**: `checkNewItem()`, `createItem()` (camelCase)
- **Config fields**: `repo_owner`, `webhook_url` (snake_case)

### Error Handling

```typescript
try {
  // Your code
} catch (error) {
  console.error('[ServiceName] Error description:', error);
  return false; // Actions return false on error
}
```

### Logging

```typescript
console.log('[ServiceName] Info message');
console.error('[ServiceName] Error message:', error);
```

### OAuth Token Retrieval Pattern

Always use this pattern to get OAuth tokens:

```typescript
const account = await this.prisma.oAuthAccount.findFirst({
  where: { userId, provider: 'SERVICE_NAME' },
});

if (!account || !account.accessToken) {
  console.error(`[Service] No account for user ${userId}`);
  return false;
}
```

### First Run Protection

Prevent spam on first AREA activation:

```typescript
if (!lastTriggered) {
  return false; // Don't trigger on first run
}
```

---

## Advanced: Adding Frontend Support

### Web Client (React)

**Add service icon to `web/src/pages/ServicesPage.tsx`:**

```typescript
const getServiceIcon = (serviceName: string) => {
  switch (serviceName.toLowerCase()) {
    case 'myservice':
      return <MyServiceIcon className="w-8 h-8" />;
    // ... other cases
  }
};
```

### Mobile Client (React Native)

**Add to `mobile/app/(tabs)/explore.tsx`:**

```typescript
const services = [
  // ... existing services
  {
    id: 'myservice',
    name: 'MyService',
    icon: 'cube-outline', // Ionicons name
    color: '#FF6B6B',
    connected: false,
  },
];
```

---

## Example: Complete Weather Service

Here's a complete example from the codebase:

### Configuration (`services.config.ts`)

```typescript
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
        },
        {
          name: 'temperature',
          label: 'Température (°C)',
          type: 'number',
          placeholder: '25',
          required: true,
        },
      ],
    },
  ],
  reactions: [
    {
      name: 'send_weather_info',
      description: 'Envoyer les informations météo',
      configFields: [
        {
          name: 'city',
          label: 'Ville',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
```

### Action Implementation (`weather.action.ts`)

```typescript
export class WeatherAction {
  async checkTemperatureAbove(
    userId: number,
    config: { city: string; temperature: number },
    lastTriggered: Date | null
  ): Promise<boolean> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${config.city}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();
    return data.main.temp > config.temperature;
  }
}
```

---

## Troubleshooting

### Action not triggering?

1. Check Hook Executor logs: `docker-compose logs -f server`
2. Verify OAuth token is valid
3. Ensure `lastTriggered` logic is correct
4. Check API rate limits

### Reaction not executing?

1. Check reaction method is called in `hook.executor.ts`
2. Verify configuration fields are correct
3. Check external API credentials
4. Look for error logs

### Service not appearing in `/about.json`?

1. Ensure service is in `SERVICES` array in `services.config.ts`
2. Restart server: `docker-compose restart server`

---

## Need Help?

- Check existing implementations in `server/src/actions/` and `server/src/reactions/`
- Review the [README.md](./README.md) for setup instructions
- Open an issue on GitHub with the `contribution` label

---

**Happy Contributing! 🚀**
