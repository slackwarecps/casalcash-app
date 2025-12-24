'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import SecureLS from 'secure-ls';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Sign out from Firebase
        if (auth) {
          await signOut(auth);
        }

        // Clear local storage
        if (typeof window !== 'undefined') {
          const ls = new SecureLS({ encodingType: 'aes' });
          ls.remove('userToken');
          ls.remove('userEmail');
        }
      } catch (error) {
        console.error('Erro durante o logout:', error);
      } finally {
        // Redirect to login page
        router.replace('/login');
      }
    };

    handleLogout();
  }, [auth, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Saindo...</p>
      </div>
    </main>
  );
}
