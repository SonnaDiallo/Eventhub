import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { firebaseDb } from '../config/firebaseAdmin';

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      coverImage,
      startDate,
      endDate,
      location,
      description,
      isFree,
      price,
      capacity,
      organizerName,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = {
      title,
      coverImage: typeof coverImage === 'string' ? coverImage : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location: typeof location === 'string' ? location : undefined,
      description: typeof description === 'string' ? description : undefined,
      isFree: typeof isFree === 'boolean' ? isFree : true,
      price: typeof price === 'number' ? price : undefined,
      capacity: typeof capacity === 'number' ? capacity : undefined,
      organizerName: typeof organizerName === 'string' ? organizerName : undefined,
      organizerUid: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await firebaseDb.collection('events').add(payload);
    return res.status(201).json({ event: { id: ref.id, ...payload } });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const joinEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;

    if (!eventId) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const eventRef = firebaseDb.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventData = eventSnap.data() as any;
    const isFree = typeof eventData?.isFree === 'boolean' ? eventData.isFree : true;
    const status = isFree ? 'confirmed' : 'pending_payment';

    const participationRef = eventRef.collection('participants').doc(userId);
    await participationRef.set(
      {
        status,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ participation: { eventId, userId, status } });
  } catch (error: any) {
    console.error('Join event error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getParticipants = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { status } = req.query;

    if (!eventId) {
      return res.status(400).json({ message: 'Invalid event id' });
    }

    const eventRef = firebaseDb.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      eventRef.collection('participants');
    if (typeof status === 'string' && (status === 'confirmed' || status === 'pending_payment')) {
      query = query.where('status', '==', status);
    }

    const snaps = await query.get();

    const participants = await Promise.all(
      snaps.docs.map(async (docSnap) => {
        const data = docSnap.data() as any;
        const uid = docSnap.id;
        const userSnap = await firebaseDb.collection('users').doc(uid).get();
        const userData = userSnap.exists ? (userSnap.data() as any) : undefined;

        return {
          id: uid,
          status: data?.status,
          user: userData
            ? {
                id: uid,
                name: userData?.name,
                email: userData?.email,
                role: userData?.role,
              }
            : null,
          createdAt: data?.createdAt,
        };
      })
    );

    const confirmed = participants.filter((p) => p.status === 'confirmed').length;
    const pending_payment = participants.filter((p) => p.status === 'pending_payment').length;

    return res.status(200).json({
      counts: {
        confirmed,
        pending_payment,
        total: confirmed + pending_payment,
      },
      participants,
    });
  } catch (error) {
    console.error('Get participants error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
