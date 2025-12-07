# Timer Examples - AREA

Guide complet pour utiliser les actions Timer avec Discord

## 🎯 Types d'Actions Timer Disponibles

### 1. `time_reached` - Heure spécifique
Déclenche une action à une heure précise chaque jour.

**Configuration:**
```json
{
  "actionService": "timer",
  "actionType": "time_reached",
  "actionConfig": {
    "hour": 14,
    "minute": 30
  },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK",
    "message": "⏰ Il est 14h30 ! Temps de faire une pause ☕"
  }
}
```

**Utilisation:** Rappels quotidiens, alarmes, notifications régulières

### 2. `date_reached` - Date spécifique
Déclenche une action à une date précise (une seule fois).

**Configuration:**
```json
{
  "actionService": "timer",
  "actionType": "date_reached",
  "actionConfig": {
    "date": "2025-12-25"
  },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK",
    "message": "🎄 Joyeux Noël ! 🎅"
  }
}
```

**Utilisation:** Rappels d'anniversaires, événements spéciaux, deadlines

### 3. `day_of_week` - Jour de la semaine
Déclenche une action chaque fois qu'on atteint un jour spécifique.

**Configuration:**
```json
{
  "actionService": "timer",
  "actionType": "day_of_week",
  "actionConfig": {
    "dayOfWeek": 1
  },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK",
    "message": "📆 C'est lundi ! Nouvelle semaine, nouveau départ 💪"
  }
}
```

**Jours de la semaine:**
- `0` = Dimanche
- `1` = Lundi
- `2` = Mardi
- `3` = Mercredi
- `4` = Jeudi
- `5` = Vendredi
- `6` = Samedi

**Utilisation:** Rappels hebdomadaires, routines, réunions récurrentes

---

## 🧪 Test Rapide (Time Alert)

Pour tester immédiatement, créez une AREA avec l'heure actuelle + 5 minutes :

### Via l'API

```bash
# 1. Récupérer l'heure actuelle + 5 minutes
# Si il est 14:25, utilisez 14:30

# 2. Créer l'AREA
curl -X POST http://localhost:3000/api/areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Timer 5min",
    "actionService": "timer",
    "actionType": "time_reached",
    "actionConfig": {
      "hour": 14,
      "minute": 30
    },
    "reactionService": "discord",
    "reactionType": "send_message",
    "reactionConfig": {
      "webhookUrl": "https://discord.com/api/webhooks/YOUR_WEBHOOK",
      "message": "⏰ Test réussi ! Le timer fonctionne parfaitement ✅"
    }
  }'
```

### Via l'Interface Web

1. Aller sur http://localhost:5173/areas
2. Cliquer sur "Create New AREA"
3. Remplir :
   - **Name**: Test Timer
   - **Action Service**: timer
   - **Action Type**: time_reached
   - **Reaction Service**: discord
   - **Reaction Type**: send_message
   - **Action Config**: `{"hour": 14, "minute": 30}`
   - **Reaction Config**: `{"webhookUrl": "https://...", "message": "Test!"}`

### Via l'App Mobile

1. Ouvrir l'app et aller dans "Mes AREAs"
2. Appuyer sur le bouton "+"
3. Remplir le formulaire :
   - Nom: Test Timer
   - Service Action: timer
   - Type Action: time_reached
   - Service Réaction: discord
   - Type Réaction: send_message
   - Webhook URL: Ton webhook Discord

---

## 💡 Exemples Pratiques

### Exemple 1: Rappel de Pause Déjeuner
```json
{
  "name": "Lunch Reminder",
  "actionService": "timer",
  "actionType": "time_reached",
  "actionConfig": { "hour": 12, "minute": 30 },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "🍽️ C'est l'heure du déjeuner ! Bon appétit 😋"
  }
}
```

### Exemple 2: Rappel de Stand-up Daily
```json
{
  "name": "Daily Standup",
  "actionService": "timer",
  "actionType": "day_of_week",
  "actionConfig": { "dayOfWeek": 1 },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "@everyone 📢 Daily standup dans 5 minutes !"
  }
}
```

### Exemple 3: Deadline de Projet
```json
{
  "name": "Project Deadline",
  "actionService": "timer",
  "actionType": "date_reached",
  "actionConfig": { "date": "2025-12-15" },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "🚨 DEADLINE PROJET ! Livraison aujourd'hui ! 📦"
  }
}
```

### Exemple 4: Rappel de Week-end
```json
{
  "name": "Weekend Reminder",
  "actionService": "timer",
  "actionType": "day_of_week",
  "actionConfig": { "dayOfWeek": 5 },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "🎉 C'est vendredi ! Week-end dans quelques heures ! 🍻"
  }
}
```

---

## 🔧 Configuration du Webhook Discord

### Créer un Webhook Discord

1. Ouvrir Discord
2. Aller dans **Paramètres du serveur** → **Intégrations**
3. Cliquer sur **Webhooks** → **Nouveau Webhook**
4. Donner un nom (ex: "AREA Bot")
5. Choisir le salon de destination
6. Copier l'**URL du Webhook**
7. Coller l'URL dans la config de ton AREA

**Format de l'URL:**
```
https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH
```

---

## ⏱️ Fonctionnement du Hook Executor

- **Fréquence**: Vérifie toutes les **2 minutes**
- **Anti-duplicate**: Ne déclenche pas la même AREA 2 fois dans les 2 minutes
- **Logs**: Affiche les actions déclenchées dans la console du serveur

### Exemple de Logs

```
[Hook Executor] Starting execution cycle...
[Hook Executor] Found 3 active areas
[Hook Executor] Processing area: Test Timer (cmivx8vl10003z57iv1filwo5)
[Timer Action] Time reached: 14:30
[Hook Executor] Area triggered: Test Timer
[Discord Reaction] Message sent successfully
[Hook Executor] Execution cycle completed
```

---

## 🧪 Tester Maintenant

1. **Créer un webhook Discord**
2. **Noter l'heure actuelle + 3 minutes**
3. **Créer une AREA avec `time_reached`**
4. **Attendre 3 minutes**
5. **Vérifier Discord** → Message reçu ✅

---

## 📊 Cas d'Usage Réels

### Pour une Équipe de Dev
- **9h00** : "☀️ Bonjour l'équipe ! Bonne journée de code !"
- **12h30** : "🍽️ Pause déjeuner"
- **15h00** : "☕ Pause café"
- **18h00** : "👋 Fin de journée, à demain !"

### Pour un Projet
- **Lundi** : "📅 Début de sprint, go go go !"
- **Vendredi** : "📊 Demo day demain, préparez vos présentations"
- **Date spécifique** : "🚀 Release v2.0 aujourd'hui !"

### Personnel
- **Tous les jours 8h** : "💪 Morning motivation"
- **Dimanche** : "🧘 Jour de repos, relax !"
- **Anniversaire** : "🎂 Joyeux anniversaire !"

---

**Note**: Le hook executor tourne toutes les 2 minutes, donc votre timer sera déclenché dans une fenêtre de ±2 minutes autour de l'heure configurée.
