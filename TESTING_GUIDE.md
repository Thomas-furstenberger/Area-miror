# Guide de Test - AREA MVP

## Démarrage

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:web
```

## Test 1 : Authentification

### Google OAuth
1. http://localhost:5173/login
2. Cliquer "Sign in with Google"
3. Autoriser l'accès
4. ✅ Redirection vers l'app, utilisateur connecté

### Email/Password
1. http://localhost:5173/register
2. Créer un compte (email + mot de passe)
3. Login avec les credentials
4. ✅ Utilisateur connecté

## Test 2 : AREA Gmail → Discord

### Prérequis
- Compte Gmail connecté via OAuth
- Webhook Discord : Server → Settings → Integrations → Webhooks → New Webhook

### Steps
1. http://localhost:5173/areas
2. "+ New AREA"
3. Remplir :
   - Name: "Email Alert"
   - IF: Gmail - email_received
   - THEN: Discord - send_message
   - Webhook URL: [votre webhook]
   - Message: "Nouveau mail reçu!"
4. Create AREA
5. ✅ AREA apparaît dans la liste (badge "Active" vert)

### Trigger
1. Envoyer un email à votre Gmail
2. Attendre 2 minutes maximum
3. Vérifier les logs serveur :
   ```
   [Hook Executor] Starting execution cycle...
   [Gmail Action] Found 1 unread emails
   [Discord Reaction] Message sent successfully
   ```
4. ✅ Message reçu sur Discord avec le sujet de l'email

## Test 3 : AREA Timer → Discord

### Steps
1. http://localhost:5173/areas
2. "+ New AREA"
3. Remplir :
   - Name: "Daily reminder"
   - IF: Timer - time_reached
   - THEN: Discord - send_message
   - Config : `{"hour": 14, "minute": 30}`
   - Webhook URL: [votre webhook]
4. ✅ À 14h30, message Discord envoyé automatiquement

## Test 4 : Gestion des AREA

### Toggle Active/Inactive
1. Page /areas
2. Cliquer "Pause" sur une AREA
3. ✅ Badge passe à "Inactive" (rouge)
4. Cliquer "Activate"
5. ✅ Badge passe à "Active" (vert)
6. L'AREA inactive ne se déclenche plus

### Delete
1. Cliquer "Delete" sur une AREA
2. Confirmer
3. ✅ AREA disparaît de la liste

## Test 5 : API Endpoints

### About.json
```bash
curl http://localhost:3000/about.json | jq
```
✅ Liste des 6 services avec actions/réactions

### Create AREA
```bash
curl -X POST http://localhost:3000/api/areas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test AREA",
    "actionService": "gmail",
    "actionType": "email_received",
    "reactionService": "discord",
    "reactionType": "send_message",
    "reactionConfig": {"webhookUrl": "https://discord.com/api/webhooks/..."}
  }'
```
✅ Retourne l'AREA créée

### List AREAs
```bash
curl http://localhost:3000/api/areas \
  -H "Authorization: Bearer YOUR_TOKEN"
```
✅ Retourne toutes les AREA de l'utilisateur

## Test 6 : Base de données

```bash
npm --workspace=server -- npx prisma studio
```

✅ Ouvrir l'interface graphique
✅ Tables visibles : User, Area, OAuthAccount, Session
✅ Données visibles

## Test 7 : Gmail send email (REAction)

### Créer AREA Timer → Gmail
1. IF: Timer - time_reached `{"hour": 15, "minute": 0}`
2. THEN: Gmail - send_email
3. Config: `{"to": "test@example.com", "subject": "Test", "body": "Hello"}`
4. ✅ Email envoyé à 15h00

## Debug

### Serveur ne démarre pas
- Vérifier DATABASE_URL dans server/.env
- `npm --workspace=server -- npx prisma migrate dev`

### Hook ne se déclenche pas
- Vérifier AREA est "Active"
- Attendre 2 minutes complètes
- Regarder logs serveur

### Discord webhook erreur
```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test"}'
```
Si erreur → webhook invalide

### Gmail pas détecté
- Vérifier OAuth token valide dans table OAuthAccount
- Email doit être non lu
- Provider doit être "GOOGLE" (majuscules)

## Résumé Tests

✅ Authentication (Google OAuth + Email/Password)
✅ AREA Creation (Gmail → Discord)
✅ AREA Creation (Timer → Discord)
✅ AREA Execution (Hook toutes les 2 min)
✅ AREA Management (Toggle, Delete)
✅ API REST (4 endpoints)
✅ Base de données (Prisma + PostgreSQL)
✅ Interface Web (Liste + Form)

**MVP validé : 2 services qui interagissent automatiquement** ✅
