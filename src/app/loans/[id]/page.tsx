'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { initialLoans } from '@/lib/data';
import type { Loan, Installment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [loan, setLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (id) {
      const foundLoan = initialLoans.find(l => l.id === id);
      // @ts-ignore
      setLoan(foundLoan || null);
    }
  }, [id]);

  if (!loan) {
    return <div>Carregando...</div>;
  }
  
  const handleStatusChange = (installmentId: string, isPaid: boolean) => {
    // This will be implemented in the next step
    console.log(`Installment ${installmentId} status changed to ${isPaid}`);
  };

  const progress = (loan.paidInstallments / loan.installments) * 100;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{loan.description}</CardTitle>
          <CardDescription>
            {loan.borrower} deve a {loan.lender} | Empréstimo iniciado em {format(loan.date, "dd/MM/yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-2 mb-6">
                <Progress value={progress} className="w-full h-3" />
                <span className="text-sm text-muted-foreground">
                    {loan.paidInstallments} de {loan.installments} parcelas pagas ({formatCurrency(loan.totalAmount)})
                </span>
            </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Paga?</TableHead>
                <TableHead>Nº da Parcela</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Data de Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loan.installmentDetails.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell>
                    <Checkbox
                      checked={installment.isPaid}
                      onCheckedChange={(checked) => handleStatusChange(installment.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{installment.installmentNumber}</TableCell>
                  <TableCell>{formatCurrency(installment.amount)}</TableCell>
                  <TableCell>{format(installment.dueDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>
                    {installment.paidDate ? format(installment.paidDate, "dd/MM/yyyy", { locale: ptBR }) : 'Pendente'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Adicionar Parcela</Button>
            <Button>Salvar Alterações</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
