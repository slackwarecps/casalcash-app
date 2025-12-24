'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
        <Ghost className="h-24 w-24 mb-6 text-primary animate-bounce" />
        <h1 className="text-6xl font-extrabold text-primary font-headline">404</h1>
        <h2 className="text-3xl font-bold mt-4">Página Perdida no Multiverso</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
            Eita! Parece que esta página foi para uma dimensão onde as meias nunca perdem seus pares. Infelizmente, não temos acesso a ela.
        </p>
        <Link href="/" passHref>
          <Button className="mt-8" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Voltar para a Realidade (Home)
          </Button>
        </Link>
    </div>
  );
}
