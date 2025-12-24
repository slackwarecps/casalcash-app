'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>
            Análise detalhada das suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Esta página de relatórios está em construção.</p>
        </CardContent>
      </Card>
    </main>
  );
}
