# 🔧 Correction de l'URL dans Thunder Client

## ❌ Problème

L'URL dans Thunder Client est malformée : `http:///api/events/cleanup/paris-opendata`

Il manque le hostname (`localhost:5000`).

## ✅ Solution

### Option 1 : URL complète dans chaque requête

Dans Thunder Client, utilisez l'URL **complète** :

```
http://localhost:5000/api/events/cleanup/paris-opendata
```

**Pas juste** `/api/events/cleanup/paris-opendata`

### Option 2 : Configurer une variable d'environnement dans Thunder Client

1. Dans Thunder Client, cliquez sur **"Env"** (en haut à droite)
2. Créez une nouvelle variable d'environnement :
   - **Name** : `base_url`
   - **Value** : `http://localhost:5000`
3. Dans vos requêtes, utilisez : `{{base_url}}/api/events/cleanup/paris-opendata`

---

## 📋 Toutes les URLs complètes

### Supprimer les événements Paris Open Data
```
DELETE http://localhost:5000/api/events/cleanup/paris-opendata
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

### Vérifier la configuration
```
GET http://localhost:5000/api/events/debug
```

### Vérifier le token
```
GET http://localhost:5000/api/events/verify-token
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

### Synchroniser les événements
```
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

### Se connecter
```
POST http://localhost:5000/api/auth/login
Body (JSON): {
  "email": "organisateur@test.com",
  "password": "password123"
}
```

### Créer un compte
```
POST http://localhost:5000/api/auth/register
Body (JSON): {
  "name": "Organisateur Test",
  "email": "organisateur@test.com",
  "password": "password123",
  "role": "organizer"
}
```

---

## ⚠️ Important

Toutes les URLs doivent commencer par `http://localhost:5000` (ou votre IP si vous testez depuis un autre appareil).

Le serveur backend doit être démarré sur le port 5000 pour que ces requêtes fonctionnent.
