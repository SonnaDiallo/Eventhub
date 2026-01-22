# 🚀 Obtenir une clé API Eventbrite en 3 minutes

## ⚡ Guide ultra-rapide

### Étape 1 : Créer un compte Eventbrite (1 minute)

1. Allez sur : **https://www.eventbrite.com/platform/api-keys/**
2. Cliquez sur **"Sign Up"** (en haut à droite)
3. Remplissez le formulaire :
   - Email
   - Mot de passe
   - Nom
4. Confirmez votre email si nécessaire

### Étape 2 : Obtenir votre token (1 minute)

1. Une fois connecté, vous serez redirigé vers la page des API Keys
2. **Si vous voyez "Personal OAuth Token"** → Copiez-le directement
3. **Sinon**, cliquez sur **"Create API Key"** ou **"Generate Token"**
4. **Copiez votre token** (il ressemble à : `PERSONAL_OAUTH_TOKEN_xxxxxxxxxxxxx`)

### Étape 3 : Ajouter dans `.env` (30 secondes)

1. Ouvrez le fichier `backend/.env`
2. Ajoutez cette ligne :

```env
EVENTBRITE_API_KEY=PERSONAL_OAUTH_TOKEN_votre_token_ici
```

**⚠️ Remplacez `PERSONAL_OAUTH_TOKEN_votre_token_ici` par votre vrai token !**

### Étape 4 : Redémarrer le serveur (30 secondes)

1. Arrêtez votre serveur backend (Ctrl+C dans le terminal)
2. Redémarrez-le :

```bash
cd backend
npm run dev
```

### Étape 5 : Vérifier (10 secondes)

```bash
GET http://localhost:5000/api/events/debug
```

Vous devriez voir :
```json
{
  "apis_configured": {
    "eventbrite": true,
    "total": 1
  }
}
```

✅ **Si `eventbrite: true` → C'est bon ! Vous pouvez synchroniser !**

---

## 🎯 Synchroniser les événements

Une fois la clé API configurée :

```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

---

## 💡 Si vous avez des problèmes

### "Email already in use"
→ Connectez-vous directement avec votre compte existant

### "Cannot find API Key section"
→ Essayez : https://www.eventbrite.com/account-settings/apps

### Le token ne fonctionne pas
→ Vérifiez que vous avez copié le token complet (il fait plusieurs centaines de caractères)

---

## 📝 Exemple de fichier `.env`

Votre fichier `backend/.env` devrait ressembler à ça :

```env
# Firebase (si vous l'avez)
FIREBASE_WEB_API_KEY=votre_cle_firebase

# Eventbrite (OBLIGATOIRE pour synchroniser)
EVENTBRITE_API_KEY=PERSONAL_OAUTH_TOKEN_xxxxxxxxxxxxx

# Unsplash (optionnel mais recommandé pour les images)
UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

---

## ✅ Checklist

- [ ] Compte Eventbrite créé
- [ ] Token API copié
- [ ] Token ajouté dans `backend/.env`
- [ ] Serveur backend redémarré
- [ ] Vérifié avec `GET /api/events/debug` → `eventbrite: true`
- [ ] Synchronisé avec `POST /api/events/sync/external`

Une fois tout coché, les événements apparaîtront dans votre app mobile ! 🎉
