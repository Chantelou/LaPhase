# Spécification de l'API REST — AI Study Assistant

Toutes les requêtes retournent un format JSON unifié. En cas de succès, la réponse contient `{ success: true, ... }`. En cas d'erreur, elle renvoie `{ success: false, error: { code: string, message: string } }`.

---

## 1. Santé du Système

### `GET /api/health`
Vérifie la disponibilité du serveur, l'état de la connexion MongoDB auto-hébergée et des clés d'API IA.

* **Réponse 200 OK :**
```json
{
  "status": "ok",
  "timestamp": "2026-09-08T14:18:51.865Z",
  "service": "AI Study Assistant",
  "environment": "development",
  "database": {
    "connected": false,
    "configured": false
  },
  "aiProviders": {
    "gemini": true,
    "mistral": false
  }
}
```

---

## 2. Outils Pédagogiques IA

### `POST /api/ai/chat`
Discussion interactive avec le tuteur d'étude.

* **Headers :** `Content-Type: application/json`
* **Corps de la requête :**
```json
{
  "message": "Peux-tu m'expliquer le principe de Bernoulli ?",
  "history": [
    { "role": "user", "content": "Bonjour" },
    { "role": "assistant", "content": "Bonjour ! De quoi as-tu besoin aujourd'hui ?" }
  ],
  "sessionId": "opt_session_id"
}
```
* **Réponse 200 OK :**
```json
{
  "success": true,
  "provider": "gemini",
  "message": "Le principe de Bernoulli stipule que...",
  "timestamp": "2026-09-08T14:20:00.000Z"
}
```

---

### `POST /api/ai/summary`
Synthèse de notes de cours ou d'articles en fiche structurée.

* **Corps de la requête :**
```json
{
  "text": "Texte brut du cours d'au moins 20 caractères...",
  "subject": "Biologie végétale",
  "length": "medium"
}
```
* **Options `length` :** `"short"`, `"medium"`, `"detailed"`
* **Réponse 200 OK :**
```json
{
  "success": true,
  "provider": "gemini",
  "summary": "# Fiche de Révision : Biologie végétale\n...",
  "savedItem": {
    "_id": "...",
    "type": "summary",
    "title": "Résumé : Biologie végétale",
    "createdAt": "..."
  }
}
```

---

### `POST /api/ai/quiz`
Génération d'un quiz interactif avec questions et rétroaction pédagogique.

* **Corps de la requête :**
```json
{
  "subject": "Histoire contemporaine",
  "questionCount": 5,
  "difficulty": "medium",
  "type": "multiple_choice"
}
```
* **Options `difficulty` :** `"easy"`, `"medium"`, `"hard"`
* **Options `type` :** `"multiple_choice"`, `"true_false"`, `"open_short"`
* **Réponse 200 OK :**
```json
{
  "success": true,
  "provider": "gemini",
  "questions": [
    {
      "id": 1,
      "question": "En quelle année s'est achevée la Seconde Guerre mondiale ?",
      "options": ["A) 1943", "B) 1944", "C) 1945", "D) 1946"],
      "correctAnswer": "C) 1945",
      "explanation": "Le conflit a pris fin en Europe en mai 1945 et en Asie en septembre 1945."
    }
  ]
}
```

---

### `POST /api/ai/flashcards`
Génération de flashcards recto/verso pour la mémorisation active.

* **Corps de la requête :**
```json
{
  "topicOrText": "Formules de trigonométrie",
  "count": 5
}
```
* **Réponse 200 OK :**
```json
{
  "success": true,
  "provider": "gemini",
  "flashcards": [
    {
      "front": "Que vaut sin²(x) + cos²(x) ?",
      "back": "1 pour tout x réel.",
      "hint": "Identité pythagoricienne fondamentale"
    }
  ]
}
```

---

### `POST /api/ai/study-plan`
Conception d'un calendrier de révision structuré jour par jour.

* **Corps de la requête :**
```json
{
  "subject": "Microéconomie",
  "goal": "Obtenir 15/20 au partiel",
  "availableDays": 7,
  "studentLevel": "intermediate"
}
```
* **Réponse 200 OK :**
```json
{
  "success": true,
  "provider": "gemini",
  "plan": {
    "overview": "Plan intensif sur 7 jours axé sur les élasticités et le marché.",
    "totalDays": 7,
    "schedule": [
      {
        "dayNumber": 1,
        "title": "Fondements de l'offre et de la demande",
        "focus": "Courbes d'équilibre et élasticités prix",
        "estimatedMinutes": 90,
        "tasks": ["Relire chap. 1", "Faire 3 exercices sur l'élasticité"],
        "tips": "Faire des graphiques à main levée pour visualiser l'équilibre."
      }
    ]
  }
}
```

---

### `POST /api/ai/explain`
Vulgarisation et explication graduée d'une notion difficile.

* **Corps de la requête :**
```json
{
  "concept": "L'entropie",
  "level": "explain_like_i_am_10"
}
```
* **Options `level` :** `"explain_like_i_am_10"`, `"beginner"`, `"intermediate"`, `"advanced"`

---

## 3. Gestion de l'Historique

### `GET /api/history`
Liste les documents et synthèses d'étude générés pour l'étudiant.

### `DELETE /api/history/:id`
Supprime un document ou une session de révision par son identifiant.
