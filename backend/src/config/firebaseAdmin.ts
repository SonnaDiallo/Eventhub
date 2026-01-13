import admin from 'firebase-admin';

export const firebaseAdminApp = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

export const firebaseAuth = admin.auth(firebaseAdminApp);
export const firebaseDb = admin.firestore(firebaseAdminApp);
