
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ReportsLandingPage() {
  const router = useRouter();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Central de Relatórios</CardTitle>
          <CardDescription>
            Acesse os relatórios detalhados para analisar as finanças do casal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/reports/relatorio-despesas-realizadas" passHref legacyBehavior>
            <a>
              <Card className="hover:bg-accent hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <BarChart className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Relatório Geral de Despesas</CardTitle>
                      <CardDescription>Visualize todos os lançamentos do mês em um único lugar.</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
              </Card>
            </a>
          </Link>

          <Link href="/reports/fixed-expenses" passHref legacyBehavior>
            <a>
              <Card className="hover:bg-accent hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Relatório de Despesas Fixas</CardTitle>
                      <CardDescription>Acompanhe os gastos recorrentes e planejados do mês.</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
              </Card>
            </a>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
