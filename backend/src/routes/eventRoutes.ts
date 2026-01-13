import { Router } from 'express';
import { createEvent, getParticipants, joinEvent } from '../controllers/eventController';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.post('/', requireAuth, requireRole('organizer'), createEvent);
router.post('/:id/join', requireAuth, joinEvent);
router.get('/:id/participants', getParticipants);

export default router;
