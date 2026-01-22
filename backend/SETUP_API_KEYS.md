# 🔑 Configuration rapide des clés API

## ⚡ Solution la plus rapide : Eventbrite (5 minutes)

### Étape 1 : Créer un compte Eventbrite

1. Allez sur https://www.eventbrite.com/platform/api-keys/
2. Cliquez sur "Sign Up" ou "Log In"
3. Créez un compte (gratuit)

### Étape 2 : Obtenir votre clé API

1. Une fois connecté, allez sur https://www.eventbrite.com/platform/api-keys/
2. Cliquez sur "Create API Key" ou "Personal OAuth Token"
3. **Copiez votre token** (il ressemble à : `PERSONAL_OAUTH_TOKEN_xxxxxxxxxxxxx`)

### Étape 3 : Ajouter dans `.env`

Dans le fichier `backend/.env`, ajoutez :

```env
EVENTBRITE_API_KEY=PERSONAL_OAUTH_TOKEN_xxxxxxxxxxxxx
```

**⚠️ Important :** Remplacez `PERSONAL_OAUTH_TOKEN_xxxxxxxxxxxxx` par votre vrai token !

### Étape 4 : Redémarrer le serveur

```bash
cd backend
npm run dev
```

### Étape 5 : Synchroniser les événements

Maintenant, avec votre token JWT d'organisateur :

```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

---

## 🎯 Alternative : Ticketmaster (aussi rapide)

### Étape 1 : Créer un compte développeur

1. Allez sur https://developer.ticketmaster.com/
2. Cliquez sur "Sign Up"
3. Créez un compte (gratuit)

### Étape 2 : Obtenir votre clé API

1. Une fois connecté, créez une nouvelle application
2. **Copiez votre API Key** (il ressemble à : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Étape 3 : Ajouter dans `.env`

```env
TICKETMASTER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Étape 4 : Redémarrer et synchroniser

Redémarrez le serveur et synchronisez comme ci-dessus.

---

## 💡 Recommandation

**Pour votre projet final**, je recommande **Eventbrite** car :
- ✅ Plus simple à configurer
- ✅ Beaucoup d'événements locaux et gratuits
- ✅ Images incluses avec les événements
- ✅ API très bien documentée

---

## 📝 Exemple de fichier `.env` complet

```env
# Firebase
FIREBASE_WEB_API_KEY=votre_cle_firebase_web

# APIs événementielles (au moins UNE est requise)
EVENTBRITE_API_KEY=votre_cle_eventbrite
# OU
TICKETMASTER_API_KEY=votre_cle_ticketmaster
# OU
SEATGEEK_CLIENT_ID=votre_client_id_seatgeek

# Images (optionnel mais recommandé)
UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

---

## ✅ Vérifier la configuration

Après avoir ajouté la clé API, vérifiez :

```bash
GET http://localhost:5000/api/events/debug
```

Vous devriez voir :
```json
{
  "apis_configured": {
    "eventbrite": true,
    "ticketmaster": false,
    "seatgeek": false,
    "total": 1
  },
  ...
}
```

Si `total: 1` ou plus, vous pouvez synchroniser ! 🎉
