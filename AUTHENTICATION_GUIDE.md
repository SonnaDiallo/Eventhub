# 🔐 Guide d'authentification - Obtenir un token pour synchroniser les événements

## 🎯 Objectif

Pour synchroniser les événements depuis les APIs (Eventbrite, Ticketmaster, SeatGeek), vous devez :
1. ✅ Avoir un compte avec le rôle **`organizer`**
2. ✅ Obtenir un token JWT en vous connectant
3. ✅ Utiliser ce token pour appeler l'API de synchronisation

---

## 📋 Option 1 : Créer un nouveau compte organizer

### Étape 1 : Créer le compte

**Requête :** `POST /api/auth/register`

**Dans Thunder Client :**
- Méthode : `POST`
- URL : `http://localhost:5000/api/auth/register`
- **Body (JSON) :**
```json
{
  "name": "Votre Nom",
  "email": "organizer@example.com",
  "password": "votre_mot_de_passe_securise",
  "role": "organizer"
}
```

**⚠️ Important :** Le champ `"role": "organizer"` est **OBLIGATOIRE** pour pouvoir synchroniser les événements !

**Réponse attendue :**
```json
{
  "user": {
    "id": "user123",
    "name": "Votre Nom",
    "email": "organizer@example.com",
    "role": "organizer"
  },
  "message": "User created. Use Firebase Auth to get ID token."
}
```

### Étape 2 : Se connecter pour obtenir le token

**Requête :** `POST /api/auth/login`

**Dans Thunder Client :**
- Méthode : `POST`
- URL : `http://localhost:5000/api/auth/login`
- **Body (JSON) :**
```json
{
  "email": "organizer@example.com",
  "password": "votre_mot_de_passe_securise"
}
```

**Réponse attendue :**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTczNjE4NzYwMCwiZXhwIjoxNzM2MTkxMjAwLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZXZlbnRodWItZWVkZWUiLCJzdWIiOiJ1c2VyMTIzIiwiYXV0aF90aW1lIjoxNzM2MTg3NjAwLCJleHAiOjE3MzYxOTEyMDAsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsib3JnYW5pemVyQGV4YW1wbGUuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifSwibmFtZSI6IlZvdHJlIE5vbSJ9...",
  "user": {
    "id": "user123",
    "name": "Votre Nom",
    "email": "organizer@example.com",
    "role": "organizer"
  }
}
```

**🎉 Copiez le `token` !** Vous en aurez besoin pour les prochaines étapes.

---

## 📋 Option 2 : Utiliser un compte existant

### Étape 1 : Vérifier que le compte a le rôle organizer

Si vous avez déjà un compte, connectez-vous d'abord :

**Requête :** `POST /api/auth/login`

**Body (JSON) :**
```json
{
  "email": "votre_email@example.com",
  "password": "votre_mot_de_passe"
}
```

**Réponse :**
```json
{
  "token": "...",
  "user": {
    "id": "user123",
    "name": "Votre Nom",
    "email": "votre_email@example.com",
    "role": "user"  // ⚠️ Si c'est "user" et pas "organizer"
  }
}
```

### Si le rôle est "user" et pas "organizer"

Vous avez deux options :

**Option A : Modifier le rôle dans Firestore**
1. Ouvrez Firebase Console → Firestore
2. Trouvez la collection `users`
3. Trouvez votre document utilisateur
4. Modifiez le champ `role` de `"user"` à `"organizer"`
5. Sauvegardez

**Option B : Créer un nouveau compte organizer** (voir Option 1 ci-dessus)

---

## ✅ Vérifier votre token

Une fois que vous avez le token, vérifiez-le :

**Requête :** `GET /api/events/verify-token`

**Dans Thunder Client :**
- Méthode : `GET`
- URL : `http://localhost:5000/api/events/verify-token`
- **Headers :**
  - `Authorization: Bearer VOTRE_TOKEN_COPIÉ`

**Réponse attendue :**
```json
{
  "message": "Token valide",
  "valid": true,
  "user": {
    "id": "user123",
    "email": "organizer@example.com",
    "name": "Votre Nom",
    "role": "organizer"
  },
  "permissions": {
    "canSyncEvents": true,
    "canCreateEvents": true,
    "canViewEvents": true
  }
}
```

Si `canSyncEvents` est `true`, vous pouvez synchroniser les événements !

---

## 🚀 Synchroniser les événements

Une fois le token vérifié, synchronisez les événements :

**Requête :** `POST /api/events/sync/external`

**Dans Thunder Client :**
- Méthode : `POST`
- URL : `http://localhost:5000/api/events/sync/external?location=Paris,France`
- **Headers :**
  - `Authorization: Bearer VOTRE_TOKEN_COPIÉ`
- **Body :** Aucun (laissez vide)

**Réponse attendue :**
```json
{
  "message": "Événements synchronisés avec succès depuis eventbrite",
  "imported": 25,
  "sources": ["eventbrite"],
  "breakdown": {
    "eventbrite": 25
  }
}
```

---

## 📝 Résumé des étapes

1. **Créer un compte organizer** (si vous n'en avez pas)
   ```
   POST /api/auth/register
   Body: { "name": "...", "email": "...", "password": "...", "role": "organizer" }
   ```

2. **Se connecter pour obtenir le token**
   ```
   POST /api/auth/login
   Body: { "email": "...", "password": "..." }
   ```

3. **Copier le token** depuis la réponse

4. **Vérifier le token** (optionnel mais recommandé)
   ```
   GET /api/events/verify-token
   Headers: Authorization: Bearer TOKEN
   ```

5. **Synchroniser les événements**
   ```
   POST /api/events/sync/external?location=Paris,France
   Headers: Authorization: Bearer TOKEN
   ```

---

## ⚠️ Problèmes courants

### "Email already in use"
→ Le compte existe déjà. Utilisez `/api/auth/login` au lieu de `/api/auth/register`

### "Invalid credentials"
→ Vérifiez votre email et mot de passe

### "Token invalide ou expiré"
→ Les tokens expirent après 1 heure. Reconnectez-vous pour obtenir un nouveau token

### "canSyncEvents: false"
→ Votre compte n'a pas le rôle `organizer`. Modifiez-le dans Firestore ou créez un nouveau compte

---

## 💡 Astuce

**Pour tester rapidement :**

1. Créez un compte organizer avec un email simple : `test@test.com`
2. Connectez-vous pour obtenir le token
3. Utilisez ce token pour toutes vos requêtes API

**N'oubliez pas :** Le token expire après 1 heure. Si vous obtenez une erreur "Token invalide", reconnectez-vous simplement !
