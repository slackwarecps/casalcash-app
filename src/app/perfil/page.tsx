'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail, Loader2, Users } from 'lucide-react';
import SecureLS from 'secure-ls';
import { useUser } from '@/firebase';
import withAuth from '@/hoc/withAuth';

function PerfilPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const ls = new SecureLS({ encodingType: 'aes' });
      try {
        const storedToken = ls.get('userToken');
        const storedEmail = ls.get('userEmail');
        const storedFamilyId = ls.get('familyId');
        setToken(storedToken || 'Nenhum token encontrado.');
        setEmail(storedEmail || 'Nenhum email encontrado.');
        setFamilyId(storedFamilyId || 'Nenhum ID de família encontrado.');
      } catch (e) {
        console.error('Falha ao ler o localStorage seguro:', e);
        setToken('Erro ao ler o token.');
        setEmail('Erro ao ler o email.');
        setFamilyId('Erro ao ler o ID da família.');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.push('/home-logada')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Perfil do Usuário</CardTitle>
          <CardDescription>Informações da sessão atual salvas localmente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Mail className="h-5 w-5 text-primary" />
              <span>Email Logado</span>
            </h3>
            <p className="p-3 bg-muted rounded-md text-sm break-words">{email || 'Carregando...'}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Users className="h-5 w-5 text-primary" />
              <span>ID da Família</span>
            </h3>
            <p className="p-3 bg-muted rounded-md text-sm break-words">{familyId || 'Carregando...'}</p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              <span>Token de Acesso (Criptografado no LS)</span>
            </h3>
            <p className="p-3 bg-muted rounded-md text-sm break-words max-h-48 overflow-y-auto">
              {token || 'Carregando...'}
            </p>
            <p className="text-xs text-muted-foreground">
              Este é o token de acesso armazenado. Ele está aqui apenas para fins de demonstração.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default withAuth(PerfilPage);
