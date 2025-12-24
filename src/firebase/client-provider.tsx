'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, RemoteConfigValues } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { fetchAndActivate, getAll } from 'firebase/remote-config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  const [remoteConfigValues, setRemoteConfigValues] = useState<RemoteConfigValues>({});

  useEffect(() => {
    if (firebaseServices.remoteConfig) {
      const remoteConfig = firebaseServices.remoteConfig;
      remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
      remoteConfig.defaultConfig = {
        "welcome_message": "Bem-vindo ao CasalCash!",
        "geral_versao_app": "v-.-.-",
      };

      const setValues = () => {
          const allValues = getAll(remoteConfig);
          const newValues: RemoteConfigValues = {};
          for (const key of Object.keys(allValues)) {
              newValues[key] = allValues[key].asString();
          }
          setRemoteConfigValues(newValues);
      };

      setValues(); // Set initial (default) values

      fetchAndActivate(remoteConfig)
        .then((activated) => {
          if (activated) {
            console.log('Remote Config values were activated.');
            setValues(); // Set new values after activation
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
      remoteConfigValues={remoteConfigValues}
    >
      {children}
    </FirebaseProvider>
  );
}
