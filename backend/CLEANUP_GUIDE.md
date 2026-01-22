# Guide de nettoyage - Supprimer les événements Paris Open Data

## 🎯 Problème

Les anciens événements de Paris Open Data sont toujours dans votre base de données Firestore, même si le code ne les récupère plus.

## ✅ Solution 1 : Supprimer via l'API (Recommandé)

Une route API a été créée pour supprimer automatiquement tous les événements Paris Open Data.

**Endpoint :** `DELETE /api/events/cleanup/paris-opendata`

**Exemple avec curl :**
```bash
curl -X DELETE "http://localhost:5000/api/events/cleanup/paris-opendata" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Exemple avec Postman/Thunder Client :**
- Méthode: `DELETE`
- URL: `http://localhost:5000/api/events/cleanup/paris-opendata`
- Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

**Réponse :**
```json
{
  "message": "Événements Paris Open Data supprimés avec succès",
  "deleted": 25
}
```

## ✅ Solution 2 : Filtrer dans l'app mobile (Déjà fait)

L'application mobile filtre maintenant automatiquement les événements Paris Open Data. Les événements avec :
- `source: 'paris_opendata'`
- `organizerName` contenant "Ville de Paris - Que faire à Paris"

sont automatiquement exclus de l'affichage.

## 🔄 Solution 3 : Resynchroniser avec les nouvelles APIs

Après avoir supprimé les anciens événements, resynchronisez avec les nouvelles APIs :

```bash
# Synchroniser depuis Eventbrite
POST /api/events/sync/external?location=Paris,France&api=eventbrite

# Ou depuis Ticketmaster
POST /api/events/sync/external?location=Paris,France&api=ticketmaster

# Ou toutes les APIs configurées
POST /api/events/sync/external?location=Paris,France
```

## 📝 Étapes recommandées

1. **Supprimer les anciens événements :**
   ```bash
   DELETE /api/events/cleanup/paris-opendata
   ```

2. **Vérifier que vous avez au moins une API configurée dans `.env` :**
   ```env
   EVENTBRITE_API_KEY=votre_cle
   # OU
   TICKETMASTER_API_KEY=votre_cle
   # OU
   SEATGEEK_CLIENT_ID=votre_client_id
   ```

3. **Resynchroniser les événements :**
   ```bash
   POST /api/events/sync/external?location=Paris,France
   ```

4. **Vérifier dans l'app mobile** que les nouveaux événements s'affichent correctement

## ⚠️ Note importante

- Les événements créés manuellement par vos organisateurs ne seront **PAS** supprimés
- Seuls les événements avec `source: 'paris_opendata'` seront supprimés
- Le filtre dans l'app mobile empêche l'affichage même si les événements existent encore
