'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Using a single, direct configuration, but reading the API key from environment variables.
const firebaseConfig = {
  "projectId": "casal-cash-dev",
  "appId": "1:330045548348:web:b1d7d56c5e2d83b63b2f56",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Reading API key from .env
  "authDomain": "casal-cash-dev.firebaseapp.com",
  "measurementId": "G-8B0C3E4D5E",
  "messagingSenderId": "330045548348"
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
export * from './errors';
export * from './error-emitter';