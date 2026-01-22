import admin from 'firebase-admin';
import path from 'path';

// Chemin vers le fichier de service account JSON
const serviceAccountPath = path.join(
  __dirname,
  '../../eventhub-eedee-firebase-adminsdk-fbsvc-5e4d3d81ac.json'
);

export const firebaseAdminApp = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });

export const firebaseAuth = admin.auth(firebaseAdminApp);
export const firebaseDb = admin.firestore(firebaseAdminApp);
