'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { fetchAndActivate } from 'firebase/remote-config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (firebaseServices.remoteConfig) {
      const remoteConfig = firebaseServices.remoteConfig;
      // Set a minimum fetch interval to avoid frequent requests
      remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
      // Set default values (optional, but recommended)
      remoteConfig.defaultConfig = {
        "welcome_message": "Bem-vindo ao CasalCash!",
      };

      // Fetch and activate
      fetchAndActivate(remoteConfig)
        .then((activated) => {
          if (activated) {
            console.log('Remote Config values were activated.');
          } else {
            console.log('No new Remote Config values to activate.');
          }
        })
        .catch((err) => {
          console.error('Firebase Remote Config failed to fetch', err);
        });
    }
  }, [firebaseServices.remoteConfig]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      analytics={firebaseServices.analytics}
      remoteConfig={firebaseServices.remoteConfig}
    >
      {children}
    </FirebaseProvider>
  );
}