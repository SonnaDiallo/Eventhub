# Configuration des APIs pour les événements externes

Ce document explique comment configurer les APIs pour synchroniser des événements externes avec des images de qualité pour votre projet final.

## 🎯 APIs disponibles - Système Multi-API

Le système supporte **3 APIs événementielles majeures** avec un système de fallback intelligent :

1. **Eventbrite API** - Événements locaux et communautaires avec images
2. **Ticketmaster Discovery API** - Concerts, sports, événements majeurs avec images
3. **SeatGeek API** - Concerts et événements sportifs avec images
4. **Unsplash API** (optionnel) - Images de haute qualité en fallback

**Avantage :** Vous pouvez utiliser une ou plusieurs APIs selon vos besoins !

## 📋 Configuration

### 1. Eventbrite API (Recommandé pour événements locaux)

**Idéal pour :** Ateliers, conférences, événements communautaires, événements gratuits

**Comment obtenir votre clé API :**
1. Allez sur https://www.eventbrite.com/platform/api-keys/
2. Créez un compte Eventbrite (gratuit)
3. Créez une nouvelle application
4. Copiez votre "Personal OAuth Token"

**Ajoutez dans votre fichier `.env` :**
```env
EVENTBRITE_API_KEY=votre_cle_api_eventbrite
```

**Avantages :**
- ✅ Images réelles des événements
- ✅ Beaucoup d'événements gratuits
- ✅ Métadonnées complètes (lieu, prix, description)
- ✅ Couverture internationale

**Limites :**
- Rate limit: ~2000 requêtes/heure
- Certaines données nécessitent OAuth

---

### 2. Ticketmaster Discovery API (Recommandé pour événements majeurs)

**Idéal pour :** Concerts, sports, événements dans de grandes salles

**Comment obtenir votre clé API :**
1. Allez sur https://developer.ticketmaster.com/
2. Créez un compte développeur (gratuit)
3. Créez une nouvelle application
4. Copiez votre "API Key"

**Ajoutez dans votre fichier `.env` :**
```env
TICKETMASTER_API_KEY=votre_cle_api_ticketmaster
```

**Avantages :**
- ✅ Très grande base de données d'événements
- ✅ Images de haute qualité incluses
- ✅ Excellente couverture pour concerts et sports
- ✅ Métadonnées détaillées (artistes, lieux, prix)

**Limites :**
- Rate limits selon votre plan
- Principalement événements payants

---

### 3. SeatGeek API (Recommandé pour concerts et sports)

**Idéal pour :** Concerts, événements sportifs, spectacles

**Comment obtenir votre clé API :**
1. Allez sur https://seatgeek.com/account/develop
2. Créez un compte (gratuit)
3. Créez une nouvelle application
4. Copiez votre "Client ID"

**Ajoutez dans votre fichier `.env` :**
```env
SEATGEEK_CLIENT_ID=votre_client_id_seatgeek
```

**Avantages :**
- ✅ Excellente couverture concerts/sports
- ✅ Images des artistes/performeurs
- ✅ Données de prix en temps réel
- ✅ API simple et rapide

**Limites :**
- Rate limit: ~1000 requêtes/heure (gratuit)
- Principalement événements payants

---

### 4. Unsplash API (Optionnel mais recommandé)

Unsplash fournit des images de haute qualité pour les événements qui n'ont pas d'image.

**Comment obtenir votre clé API :**
1. Allez sur https://unsplash.com/developers
2. Créez un compte (gratuit)
3. Créez une nouvelle application
4. Copiez votre "Access Key"

**Ajoutez dans votre fichier `.env` :**
```env
UNSPLASH_ACCESS_KEY=votre_access_key_unsplash
```

**Avantages :**
- ✅ Images de haute qualité et professionnelles
- ✅ Recherche intelligente basée sur le titre de l'événement
- ✅ 50 requêtes par heure en gratuit

---

## 🚀 Utilisation

### Synchroniser les événements

**Endpoint :** `POST /api/events/sync/external`

**Headers requis :**
- `Authorization: Bearer <votre_token_jwt>`
- L'utilisateur doit avoir le rôle `organizer`

**Query parameters :**

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `location` | Localisation pour la recherche | `Paris,France`, `New York,NY` |
| `category` | Catégorie d'événement (Eventbrite/Ticketmaster) | `103` (musique), `105` (arts) |
| `type` | Type d'événement (recherche textuelle) | `concert`, `sport`, `conference` |
| `api` | Forcer une API spécifique | `eventbrite`, `ticketmaster`, `seatgeek` |

**Exemples de requêtes :**

```bash
# Récupérer tous les événements disponibles (toutes les APIs configurées)
curl -X POST "http://localhost:5000/api/events/sync/external?location=Paris,France" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Récupérer uniquement des concerts depuis Eventbrite
curl -X POST "http://localhost:5000/api/events/sync/external?location=Paris,France&type=concert&api=eventbrite" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Récupérer des événements sportifs depuis Ticketmaster
curl -X POST "http://localhost:5000/api/events/sync/external?location=Paris,France&category=sport&api=ticketmaster" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse :**
```json
{
  "message": "Événements synchronisés avec succès depuis eventbrite, ticketmaster",
  "imported": 45,
  "sources": ["eventbrite", "ticketmaster"],
  "breakdown": {
    "eventbrite": 20,
    "ticketmaster": 25
  }
}
```

---

## 📊 Ordre de priorité des images

1. **Image de l'API source** : Si l'événement a une image dans Eventbrite/Ticketmaster/SeatGeek
2. **Image Unsplash** : Recherche intelligente basée sur le titre de l'événement
3. **Image par défaut** : Image Unsplash générique de haute qualité

---

## 🎨 Catégories d'images détectées automatiquement

Le système détecte automatiquement le type d'événement et recherche des images appropriées :

- Yoga / Méditation → `yoga meditation event`
- Théâtre / Spectacle → `theater performance event`
- Concert / Musique → `concert music festival`
- Conférence → `conference business event`
- Sport / Fitness → `sport fitness event`
- Art / Exposition → `art exhibition gallery`
- Danse → `dance performance event`
- Atelier / Workshop → `workshop learning event`
- Food / Cuisine → `food culinary event`
- Tech / Startup → `technology startup event`
- Enfant / Famille → `family children event`
- Par défaut → `event gathering people`

---

## ⚙️ Configuration minimale pour votre projet final

**Option 1 : Une seule API (le plus simple)**
```env
EVENTBRITE_API_KEY=votre_cle_eventbrite
UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

**Option 2 : Multi-API (meilleure couverture)**
```env
EVENTBRITE_API_KEY=votre_cle_eventbrite
TICKETMASTER_API_KEY=votre_cle_ticketmaster
SEATGEEK_CLIENT_ID=votre_client_id_seatgeek
UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

**Recommandation pour projet final :**
- Utilisez **Eventbrite + Ticketmaster** pour une excellente couverture
- Ajoutez **Unsplash** pour garantir des images de qualité
- Le système utilisera automatiquement toutes les APIs configurées

---

## 🔒 Sécurité

- Ne commitez jamais votre fichier `.env` dans Git
- Les clés API sont stockées dans les variables d'environnement
- Le fichier `.env` est déjà dans `.gitignore`

---

## 📝 Notes importantes

- Les événements passés sont automatiquement filtrés
- Les événements sont mis à jour (merge) s'ils existent déjà
- La synchronisation peut prendre quelques secondes selon le nombre d'événements
- Si plusieurs APIs sont configurées, le système les utilise toutes en parallèle
- Vous pouvez forcer une API spécifique avec le paramètre `api`

---

## 🎓 Pour votre projet final

Ce système multi-API vous permet de :

1. **Démontrer l'intégration d'APIs externes** ✅
2. **Avoir une grande variété d'événements** ✅
3. **Gérer les images de manière professionnelle** ✅
4. **Implémenter un système de fallback robuste** ✅
5. **Montrer votre capacité à travailler avec plusieurs APIs** ✅

**Conseil :** Configurez au moins 2 APIs pour montrer la robustesse de votre système !
