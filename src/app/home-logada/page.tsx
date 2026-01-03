'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CasalCashApp from '@/components/app/casal-cash-app';
import { Loader2 } from 'lucide-react';
import withAuth from '@/hoc/withAuth';

function HomeLogadaPage() {
  
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // The withAuth HOC now handles the redirect logic if user is not logged in.
  // This component will only render if the user is authenticated.
  if (isUserLoading || !user) {
    console.log("entrou na home-logada");
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 md:p-8 flex justify-center">
      <CasalCashApp />
    </main>
  );
}

export default withAuth(HomeLogadaPage);
