# 🔐 Guide de vérification du token JWT

## 🎯 Comment vérifier votre token

### Méthode 1 : Via l'API (Recommandé)

**Route :** `GET /api/events/verify-token`

Cette route vérifie si votre token est valide et vous donne vos informations utilisateur.

**Avec curl :**
```bash
curl -X GET "http://localhost:5000/api/events/verify-token" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Avec Postman/Thunder Client :**
- Méthode: `GET`
- URL: `http://localhost:5000/api/events/verify-token`
- Headers: `Authorization: Bearer VOTRE_TOKEN_JWT`

**Réponse si token valide :**
```json
{
  "message": "Token valide",
  "valid": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "organizer"
  },
  "permissions": {
    "canSyncEvents": true,
    "canCreateEvents": true,
    "canViewEvents": true
  }
}
```

**Réponse si token invalide :**
```json
{
  "message": "Token invalide ou expiré",
  "valid": false
}
```

---

### Méthode 2 : Depuis l'app mobile (Console)

Le token est automatiquement ajouté aux requêtes API. Pour le voir dans la console :

1. **Ouvrez les DevTools de React Native** (shake device ou Cmd+D / Ctrl+M)
2. **Regardez les logs** - chaque requête API affiche le token dans les logs

Ou ajoutez temporairement ce code dans votre app :

```typescript
import { getToken } from './services/authStorage';

// Afficher le token dans la console
const showToken = async () => {
  const token = await getToken();
  console.log('🔑 Token JWT:', token);
  console.log('📏 Longueur:', token?.length);
  console.log('🔍 Début:', token?.substring(0, 50) + '...');
};
```

---

### Méthode 3 : Vérifier le token manuellement

**Dans l'app mobile :**

Le token est stocké dans AsyncStorage avec la clé `eventhub_token`.

**Pour le récupérer depuis l'app :**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('eventhub_token');
console.log('Token:', token);
```

---

## 🔍 Décoder le token JWT

Un token JWT a 3 parties séparées par des points : `header.payload.signature`

Vous pouvez décoder la partie `payload` (sans vérifier la signature) pour voir les informations :

**En ligne :** https://jwt.io/

**Ou avec Node.js :**
```javascript
const token = 'VOTRE_TOKEN';
const parts = token.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
console.log('Payload:', payload);
```

---

## ⚠️ Problèmes courants

### "Token invalide ou expiré"

**Causes possibles :**
1. Le token a expiré (les tokens Firebase expirent après 1 heure)
2. Le token n'est pas complet (tronqué)
3. Le token n'est pas au bon format

**Solutions :**
1. **Reconnectez-vous** dans l'app mobile pour obtenir un nouveau token
2. Vérifiez que le token est complet (doit faire au moins 100 caractères)
3. Vérifiez le format : `Bearer TOKEN` (avec un espace après "Bearer")

### "Missing Authorization header"

**Cause :** Le header Authorization n'est pas présent dans la requête

**Solution :** Assurez-vous d'inclure le header :
```
Authorization: Bearer VOTRE_TOKEN_JWT
```

### Token trop court

**Cause :** Le token semble tronqué ou incomplet

**Vérification :**
```bash
# Vérifier la longueur du token
echo -n "VOTRE_TOKEN" | wc -c
# Doit être > 100 caractères
```

---

## 📝 Exemple complet

**1. Vérifier le token :**
```bash
GET /api/events/verify-token
Headers: Authorization: Bearer VOTRE_TOKEN
```

**2. Si le token est valide et vous êtes organisateur, synchroniser :**
```bash
POST /api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN
```

**3. Vérifier les événements :**
```bash
GET /api/events/debug
```

---

## 💡 Astuce

Pour obtenir un nouveau token :
1. **Déconnectez-vous** de l'app mobile
2. **Reconnectez-vous** avec vos identifiants
3. Un nouveau token sera généré automatiquement

Le token est valide pendant **1 heure** après la connexion.
