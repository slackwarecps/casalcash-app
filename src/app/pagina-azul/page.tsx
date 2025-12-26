'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaginaAzul() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-500 text-white p-4">
        <img 
            src="https://i.pinimg.com/736x/11/2b/05/112b051d2bf047e52151645645e9893e.jpg" 
            alt="Gato chorando"
            className="w-48 h-48 object-cover rounded-full mb-8" 
        />
      <h1 className="text-4xl font-bold text-center">Voce não esta na lista de beta users! Procure o Fábio para colocar você na lista!</h1>
      <Button 
        variant="outline" 
        onClick={() => router.push('/')} 
        className="mt-8 bg-white text-blue-500 hover:bg-blue-100 hover:text-blue-600"
      >
        Voltar
      </Button>
    </main>
  );
}
