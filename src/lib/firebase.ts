import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

export async function initializeFirebase() {
  if (getApps().length > 0) {
    return;
  }

  try {
    // 開発環境の場合は.env.localの値を使用
    if (process.env.NODE_ENV === 'development') {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };
      app = initializeApp(firebaseConfig);
    } else {
      // 本番環境の場合はAPIからコンフィグを取得
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('Failed to fetch Firebase configuration');
      }
      const firebaseConfig = await response.json();
      app = initializeApp(firebaseConfig);
    }
    
    db = getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

export async function getDb(): Promise<Firestore> {
  if (!db) {
    await initializeFirebase();
  }
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
} 