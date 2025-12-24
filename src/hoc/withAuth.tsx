'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.replace('/login');
          return;
        }

        user.getIdToken().then(token => {
          const decodedToken: { exp: number } = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            router.replace('/login');
          }
        });
      }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
      return null; // Ou um componente de loading
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
