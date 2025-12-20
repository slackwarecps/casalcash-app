'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signOut, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

// Using the configuration provided by the user.
const firebaseConfig = {
  apiKey: "AIzaSyDIzuRbi_B6266YBrIen1sbRK-F3S5NNwY",
  authDomain: "studio-3727042918-3b869.firebaseapp.com",
  projectId: "studio-3727042918-3b869",
  storageBucket: "studio-3727042918-3b869.appspot.com",
  messagingSenderId: "869021804454",
  appId: "1:869021804454:web:6af43737eb2e858d479167"
};


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase API Key. Please check your .env file.');
  }
  
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  let analytics: Analytics | null = null;
  
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(firebaseApp);
      }
    });
  }

  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp),
    analytics,
    signOut: () => signOut(auth),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
