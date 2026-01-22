# 🔑 Obtenir un token rapidement

## ✅ Solution la plus simple : Utiliser l'app mobile

Le moyen le plus simple d'obtenir un token valide est d'utiliser votre **app mobile** :

### Étape 1 : Se connecter dans l'app mobile

1. Ouvrez votre app mobile
2. Connectez-vous avec :
   - Email : `organisateur@test.com`
   - Password : `password123`

### Étape 2 : Récupérer le token depuis les logs

Le token est automatiquement sauvegardé dans l'app. Pour le voir :

**Option A : Console React Native**
1. Ouvrez les DevTools (shake device ou Cmd+D / Ctrl+M)
2. Regardez les logs - le token est affiché lors des requêtes API

**Option B : Ajouter temporairement ce code**

Dans votre app mobile, ajoutez temporairement dans un écran :

```typescript
import { getToken } from './services/authStorage';

// Afficher le token
const showToken = async () => {
  const token = await getToken();
  console.log('🔑 TOKEN:', token);
  Alert.alert('Token', token?.substring(0, 50) + '...');
};
```

Puis appelez `showToken()` depuis un bouton.

---

## 🔧 Solution alternative : Configurer FIREBASE_WEB_API_KEY

Si vous voulez obtenir le token directement depuis l'API backend :

### Étape 1 : Obtenir la clé API Firebase

1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet `eventhub-eedee`
3. Paramètres du projet (⚙️) → Général
4. Dans "Vos applications", trouvez votre app Web
5. Copiez la "Clé API Web"

### Étape 2 : Ajouter dans `.env`

Dans `backend/.env`, ajoutez :

```env
FIREBASE_WEB_API_KEY=votre_cle_api_firebase_web
```

### Étape 3 : Redémarrer le serveur

Redémarrez votre serveur backend.

### Étape 4 : Se connecter

Maintenant, quand vous appelez `POST /api/auth/login`, vous obtiendrez directement un `token` utilisable !

---

## 🚀 Utiliser le token

Une fois que vous avez le token (depuis l'app mobile ou l'API) :

**Pour synchroniser les événements :**

```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN
```

**Pour vérifier le token :**

```bash
GET http://localhost:5000/api/events/verify-token
Headers: Authorization: Bearer VOTRE_TOKEN
```

---

## 💡 Recommandation

**Pour votre projet final**, la solution la plus simple est :
1. ✅ Utiliser l'app mobile pour se connecter
2. ✅ Le token est automatiquement utilisé dans toutes les requêtes API
3. ✅ Pas besoin de copier/coller le token manuellement

L'app mobile gère déjà tout automatiquement ! 🎉
