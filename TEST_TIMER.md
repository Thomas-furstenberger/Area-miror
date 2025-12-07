# 🧪 Test Rapide - Timer → Discord

Guide pour tester les actions Timer en moins de 5 minutes.

## 🚀 Test en 3 étapes

### Étape 1: Préparer le Webhook Discord

1. Ouvrir Discord → Paramètres du serveur → Intégrations
2. Webhooks → Nouveau Webhook
3. Copier l'URL (ex: `https://discord.com/api/webhooks/123...`)

### Étape 2: Créer une AREA Timer

**Option A - Via l'interface Web** (http://localhost:5173/areas)

1. Cliquer sur "Create New AREA"
2. Remplir:
   - **Name**: Test Timer 3min
   - **Action Service**: `timer`
   - **Action Type**: `time_reached`
   - **Reaction Service**: `discord`
   - **Reaction Type**: `send_message`
3. Dans **Action Config**, mettre l'heure actuelle + 3 minutes:
   ```json
   {"hour": 14, "minute": 33}
   ```
   *(Si il est 14h30, mettez 14h33)*

4. Dans **Reaction Config**:
   ```json
   {
     "webhookUrl": "https://discord.com/api/webhooks/VOTRE_WEBHOOK",
     "message": "⏰ Test réussi ! Le timer fonctionne ✅"
   }
   ```

**Option B - Via l'app Mobile**

1. Ouvrir l'app → Onglet "Mes AREAs"
2. Appuyer sur "+"
3. Remplir le formulaire de la même manière

**Option C - Via cURL**

```bash
# Récupérer votre token
TOKEN="votre_token_ici"

# Calculer l'heure actuelle + 3 minutes
# Si il est 14:30, utilisez hour: 14, minute: 33

curl -X POST http://localhost:3000/api/areas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Timer 3min",
    "actionService": "timer",
    "actionType": "time_reached",
    "actionConfig": {
      "hour": 14,
      "minute": 33
    },
    "reactionService": "discord",
    "reactionType": "send_message",
    "reactionConfig": {
      "webhookUrl": "https://discord.com/api/webhooks/VOTRE_WEBHOOK",
      "message": "⏰ Test réussi ! Timer fonctionne parfaitement ✅"
    }
  }'
```

### Étape 3: Attendre et Vérifier

1. **Attendre 3 minutes** (le hook executor vérifie toutes les 2 min)
2. **Vérifier Discord** → Vous devriez recevoir le message
3. **Vérifier les logs du serveur**:
   ```
   [Hook Executor] Starting execution cycle...
   [Hook Executor] Found 1 active areas
   [Timer Action] Time reached: 14:33
   [Hook Executor] Area triggered: Test Timer 3min
   [Discord Reaction] Message sent successfully
   ```

---

## 📅 Autres Types de Timer

### Test "Day of Week" (aujourd'hui)

```json
{
  "name": "Test Aujourd'hui",
  "actionService": "timer",
  "actionType": "day_of_week",
  "actionConfig": {
    "dayOfWeek": 6
  },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "📆 C'est samedi ! (Test réussi)"
  }
}
```

**Jours:**
- 0 = Dimanche
- 1 = Lundi
- 2 = Mardi
- 3 = Mercredi
- 4 = Jeudi
- 5 = Vendredi
- 6 = Samedi

### Test "Date Reached" (demain)

```json
{
  "name": "Test Demain",
  "actionService": "timer",
  "actionType": "date_reached",
  "actionConfig": {
    "date": "2025-12-08"
  },
  "reactionService": "discord",
  "reactionType": "send_message",
  "reactionConfig": {
    "webhookUrl": "YOUR_WEBHOOK",
    "message": "📅 C'est le 8 décembre ! (Test réussi)"
  }
}
```

---

## 🔍 Vérifier que ça fonctionne

### Dans les logs du serveur:
```bash
cd server
npm run dev

# Vous devriez voir:
# [Hook Executor] Starting execution cycle...
# [Timer Action] Time reached: 14:33
# [Hook Executor] Area triggered: Test Timer 3min
# [Discord Reaction] Message sent successfully
```

### Dans l'interface web:
- L'AREA apparaît dans la liste
- Le toggle est vert (activé)
- `lastTriggered` est mis à jour après le déclenchement

### Dans Discord:
- Message reçu avec l'emoji ⏰
- Envoyé par "AREA Bot" (ou le nom de votre webhook)

---

## ✅ Checklist de Test

- [ ] Webhook Discord créé et copié
- [ ] AREA créée avec heure actuelle + 3 minutes
- [ ] Serveur en cours d'exécution (`npm run dev`)
- [ ] Hook executor actif (logs toutes les 2 min)
- [ ] Attente de 3 minutes
- [ ] Message Discord reçu
- [ ] AREA testée avec succès ✅

---

## 💡 Astuces

1. **Test le plus rapide**: Utilisez `time_reached` avec +2 minutes
2. **Vérifier l'heure du serveur**: Les timers utilisent l'heure du serveur (pas votre timezone locale)
3. **Fenêtre de déclenchement**: ±2 minutes (car le hook vérifie toutes les 2 min)
4. **Anti-duplicate**: Une même AREA ne peut pas se déclencher 2 fois en 2 minutes

---

## 🎯 Exemples de Messages Personnalisés

```json
// Rappel de pause
{
  "message": "☕ C'est l'heure de la pause café ! Prenez une pause de 15 minutes 😊"
}

// Rappel de réunion
{
  "message": "@everyone 📢 Daily standup dans 5 minutes ! Préparez vos updates 📝"
}

// Motivation du matin
{
  "message": "☀️ Bonjour l'équipe ! Nouvelle journée, nouveaux défis ! Let's go 💪"
}

// Fin de journée
{
  "message": "🌙 Bonne soirée tout le monde ! À demain 👋"
}
```

---

**Durée totale du test**: ~5 minutes
**Résultat attendu**: Message Discord reçu automatiquement ✅
