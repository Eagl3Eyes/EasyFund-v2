import admin from 'firebase-admin';
import { env } from './env';

let firebaseAdmin: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) return firebaseAdmin;

  if (admin.apps.length > 0) {
    firebaseAdmin = admin.apps[0]!;
    return firebaseAdmin;
  }

  const serviceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Development mode - initialize without credentials
    console.warn('Firebase Admin: No credentials provided, running in dev mode');
    firebaseAdmin = admin.initializeApp({
      projectId: env.FIREBASE_PROJECT_ID || 'easyfund-dev',
    });
  }

  return firebaseAdmin;
}

export async function verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const app = getFirebaseAdmin();
  return app.auth().verifyIdToken(idToken);
}
