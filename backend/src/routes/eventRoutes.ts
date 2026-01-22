import { Router } from 'express';
import { createEvent, getParticipants, joinEvent, verifyToken } from '../controllers/eventController';
import { syncExternalEvents, deleteParisOpenDataEvents, debugEvents } from '../controllers/externalEventsController';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { validateImage } from '../middleware/imageValidation';

const router = Router();

router.post('/', requireAuth, requireRole('organizer'), validateImage, createEvent);
router.post('/:id/join', requireAuth, joinEvent);
router.get('/:id/participants', getParticipants);

// Vérifier le token JWT de l'utilisateur
router.get('/verify-token', requireAuth, verifyToken);

// Debug: Vérifier la configuration et les événements en base
router.get('/debug', debugEvents);

// Importer / synchroniser des événements externes depuis plusieurs APIs
// Supporte: Eventbrite, Ticketmaster, SeatGeek
// Nécessite au moins une clé API dans le fichier .env
// Les images sont récupérées depuis les APIs ou Unsplash (si UNSPLASH_ACCESS_KEY est configuré)
// Query params optionnels: 
//   ?location=Paris,France
//   &category=103 (catégorie Eventbrite/Ticketmaster)
//   &type=concert (recherche par type)
//   &api=eventbrite (forcer une API spécifique: eventbrite, ticketmaster, seatgeek)
router.post('/sync/external', requireAuth, requireRole('organizer'), syncExternalEvents);

// Supprimer les anciens événements de Paris Open Data
router.delete('/cleanup/paris-opendata', requireAuth, requireRole('organizer'), deleteParisOpenDataEvents);

export default router;
