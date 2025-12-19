'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    if (process.env.NODE_ENV === 'production') {
      // In production, App Hosting provides the config via environment variables.
      // Calling initializeApp() without arguments uses that config.
      try {
        firebaseApp = initializeApp();
      } catch (e) {
        // Fallback for cases where auto-init might fail, though unlikely in App Hosting.
        console.warn('Automatic Firebase initialization failed in production. Falling back to config file.', e);
        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      // In development, we explicitly use our development config file.
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp),
    signOut: () => signOut(auth),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
