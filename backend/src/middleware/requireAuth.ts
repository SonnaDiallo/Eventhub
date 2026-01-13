import type { Request, Response, NextFunction } from 'express';
import { firebaseAuth, firebaseDb } from '../config/firebaseAdmin';

export type AuthUser = {
  userId: string;
  role?: string;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);

    const firebaseUid = decoded.uid;

    const profileSnap = await firebaseDb.collection('users').doc(firebaseUid).get();
    const profileData = profileSnap.exists ? profileSnap.data() : undefined;
    const roleFromFirestore =
      profileData && typeof profileData.role === 'string' ? profileData.role : undefined;

    (req as Request & { user?: AuthUser }).user = {
      userId: firebaseUid,
      role: roleFromFirestore,
    };

    return next();
  } catch (_firebaseError) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
