'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, LogIn, ArrowRight, Wallet, HandCoins, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    icon: <Wallet className="h-8 w-8 mb-4 text-primary" />,
    title: 'Gestão de Despesas',
    description: 'Cadastre gastos fixos e variáveis, saiba quem pagou e como o valor foi dividido entre o casal.',
  },
  {
    icon: <HandCoins className="h-8 w-8 mb-4 text-primary" />,
    title: 'Controle de Empréstimos',
    description: 'Gerencie empréstimos e compras parceladas, acompanhando o pagamento de cada parcela de forma clara.',
  },
  {
    icon: <Sparkles className="h-8 w-8 mb-4 text-primary" />,
    title: 'Reconciliação Inteligente',
    description: 'Use nossa IA para analisar as finanças do mês e descobrir de forma simples quem deve pagar a quem.',
  },
];

export default function LandingPage() {
   const { user, isUserLoading } = useUser();
  const router = useRouter();

  // Redirect to the main app if the user is already logged in.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/home-logada');
    }
  }, [user, isUserLoading, router]);

  // Only render the landing page if the user is definitively not logged in.
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Landmark className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold font-headline">CasalCash</span>
          </Link>
          <nav>
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm">
                Login
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container text-center py-20 sm:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline lg:text-6xl">
            A vida financeira a dois, <span className="text-primary">simplificada</span>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Dê adeus às planilhas complicadas. O CasalCash organiza as contas, dívidas e orçamentos de forma transparente e colaborativa.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login" passHref>
              <Button size="lg">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-16 sm:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Tudo que vocês precisam para se organizar</h2>
              <p className="mt-4 text-muted-foreground">Funcionalidades pensadas para a realidade financeira de um casal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-card">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-center gap-1 h-16 sm:h-20 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Landmark className="h-4 w-4" />
                <span>CasalCash</span>
            </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CasalCash. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
