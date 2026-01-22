# 🚀 Guide Rapide - Synchroniser les événements depuis les APIs

## ⚡ Solution rapide en 3 étapes

### Étape 1 : Configurer une API (5 minutes)

**Option A : Eventbrite (Recommandé - Gratuit)**
1. Allez sur https://www.eventbrite.com/platform/api-keys/
2. Créez un compte (gratuit)
3. Créez une application
4. Copiez votre "Personal OAuth Token"

**Option B : Ticketmaster (Gratuit)**
1. Allez sur https://developer.ticketmaster.com/
2. Créez un compte développeur (gratuit)
3. Créez une application
4. Copiez votre "API Key"

**Option C : SeatGeek (Gratuit)**
1. Allez sur https://seatgeek.com/account/develop
2. Créez un compte (gratuit)
3. Créez une application
4. Copiez votre "Client ID"

### Étape 2 : Ajouter la clé dans `.env`

Dans le fichier `backend/.env`, ajoutez :

```env
# Au moins UNE de ces lignes est REQUISE
EVENTBRITE_API_KEY=votre_cle_api_eventbrite
# OU
TICKETMASTER_API_KEY=votre_cle_api_ticketmaster
# OU
SEATGEEK_CLIENT_ID=votre_client_id_seatgeek

# Optionnel mais recommandé pour les images
UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

### Étape 3 : Synchroniser les événements

**Méthode 1 : Via l'API (Recommandé)**

Avec votre token JWT d'organisateur :

```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer VOTRE_TOKEN_JWT
```

**Avec curl :**
```bash
curl -X POST "http://localhost:5000/api/events/sync/external?location=Paris,France" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Avec Postman/Thunder Client :**
- Méthode: `POST`
- URL: `http://localhost:5000/api/events/sync/external?location=Paris,France`
- Headers: `Authorization: Bearer VOTRE_TOKEN_JWT`

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

## 🔍 Vérifier la configuration

**Route de debug :** `GET /api/events/debug`

```bash
GET http://localhost:5000/api/events/debug
```

Cette route vous montre :
- ✅ Quelles APIs sont configurées
- ✅ Combien d'événements sont en base
- ✅ D'où viennent les événements

## 📱 Résultat

Après la synchronisation :
1. **Redémarrez votre app mobile** (ou attendez quelques secondes)
2. Les événements apparaîtront automatiquement dans la liste
3. Chaque événement aura une image de qualité

## 🎯 Paramètres de synchronisation

Vous pouvez personnaliser la synchronisation :

```bash
# Par localisation
?location=Paris,France
?location=New York,NY
?location=Lyon,France

# Par type d'événement
?type=concert
?type=sport
?type=conference

# Forcer une API spécifique
?api=eventbrite
?api=ticketmaster
?api=seatgeek

# Combinaisons
?location=Paris,France&type=concert&api=eventbrite
```

## ⚠️ Problèmes courants

### "Aucune API configurée"
→ Vérifiez votre fichier `.env` et redémarrez le serveur backend

### "Aucun événement externe trouvé"
→ Vérifiez :
- La clé API est correcte
- Il y a des événements dans la zone recherchée
- Les logs du serveur pour voir les erreurs

### Les événements ne s'affichent pas dans l'app
→ Vérifiez :
- Les événements sont bien en base (`GET /api/events/debug`)
- Les événements ont une date future
- L'app mobile est bien connectée à Firestore

## 💡 Astuce

Pour avoir plus d'événements, configurez **plusieurs APIs** :

```env
EVENTBRITE_API_KEY=votre_cle
TICKETMASTER_API_KEY=votre_cle
SEATGEEK_CLIENT_ID=votre_client_id
UNSPLASH_ACCESS_KEY=votre_cle
```

Ensuite synchronisez sans spécifier d'API pour utiliser toutes les sources :
```bash
POST /api/events/sync/external?location=Paris,France
```

## 📚 Documentation complète

- `backend/API_SETUP.md` - Configuration détaillée des APIs
- `backend/RESYNC_GUIDE.md` - Guide de resynchronisation
- `backend/CLEANUP_GUIDE.md` - Nettoyage des anciens événements
