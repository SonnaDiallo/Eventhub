# Guide de resynchronisation des événements

## 🎯 Problème : Plus d'événements après nettoyage

Après avoir supprimé les événements Paris Open Data, vous n'avez plus d'événements. C'est normal ! Il faut maintenant resynchroniser depuis les nouvelles APIs.

## ✅ Étapes pour resynchroniser

### Étape 1 : Vérifier la configuration

**Route de debug :** `GET /api/events/debug`

Cette route vous montre :
- Quelles APIs sont configurées
- Combien d'événements sont en base
- D'où viennent les événements

**Exemple :**
```bash
GET http://localhost:5000/api/events/debug
```

**Réponse attendue :**
```json
{
  "apis_configured": {
    "eventbrite": true,
    "ticketmaster": false,
    "seatgeek": false,
    "total": 1
  },
  "events_in_database": {
    "total": 0,
    "by_source": {},
    "future_events": 0
  },
  "message": "APIs configurées. Utilisez POST /api/events/sync/external pour synchroniser."
}
```

### Étape 2 : Configurer au moins une API

Si aucune API n'est configurée, ajoutez dans votre fichier `.env` :

**Option 1 : Eventbrite (Recommandé pour événements locaux)**
```env
EVENTBRITE_API_KEY=votre_cle_api_eventbrite
```

**Option 2 : Ticketmaster (Recommandé pour concerts/sports)**
```env
TICKETMASTER_API_KEY=votre_cle_api_ticketmaster
```

**Option 3 : SeatGeek (Recommandé pour concerts/sports)**
```env
SEATGEEK_CLIENT_ID=votre_client_id_seatgeek
```

**Comment obtenir les clés :**
- Eventbrite : https://www.eventbrite.com/platform/api-keys/
- Ticketmaster : https://developer.ticketmaster.com/
- SeatGeek : https://seatgeek.com/account/develop

### Étape 3 : Resynchroniser les événements

**Route :** `POST /api/events/sync/external`

**Avec Eventbrite :**
```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France&api=eventbrite
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

**Avec Ticketmaster :**
```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France&api=ticketmaster
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

**Toutes les APIs configurées :**
```bash
POST http://localhost:5000/api/events/sync/external?location=Paris,France
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

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

### Étape 4 : Vérifier dans l'app mobile

Rechargez votre application mobile. Les nouveaux événements devraient apparaître !

## 🔍 Dépannage

### Problème : "Aucune API configurée"

**Solution :** Vérifiez votre fichier `.env` et redémarrez le serveur backend.

### Problème : "Aucun événement externe trouvé"

**Causes possibles :**
1. La clé API est incorrecte
2. Il n'y a pas d'événements dans la zone recherchée
3. Les événements sont tous passés

**Solutions :**
- Vérifiez les logs du serveur pour voir les erreurs API
- Essayez une autre localisation : `?location=New York,NY`
- Essayez une autre API si disponible

### Problème : Les événements ne s'affichent pas dans l'app

**Vérifications :**
1. Vérifiez que les événements sont bien en base avec `/api/events/debug`
2. Vérifiez que les événements ont une date future
3. Vérifiez les logs de l'app mobile pour les erreurs Firestore

## 📝 Exemple complet

```bash
# 1. Vérifier la configuration
curl http://localhost:5000/api/events/debug

# 2. Synchroniser depuis Eventbrite
curl -X POST "http://localhost:5000/api/events/sync/external?location=Paris,France&api=eventbrite" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Vérifier à nouveau
curl http://localhost:5000/api/events/debug
```

## 💡 Astuce

Pour avoir plus d'événements, configurez plusieurs APIs :
```env
EVENTBRITE_API_KEY=votre_cle
TICKETMASTER_API_KEY=votre_cle
UNSPLASH_ACCESS_KEY=votre_cle  # Pour les images
```

Ensuite synchronisez sans spécifier d'API pour utiliser toutes les sources :
```bash
POST /api/events/sync/external?location=Paris,France
```
