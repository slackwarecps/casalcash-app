'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Loan } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDoc, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const loanDocRef = useMemo(() => {
    if (!id) return null;
    return doc(firestore, 'couples', COUPLE_ID, 'loans', id as string);
  }, [firestore, id]);

  const { data: loanData, isLoading } = useDoc<Loan>(loanDocRef);

  // Local state to manage UI changes before they are saved.
  const [localLoan, setLocalLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (loanData) {
      // Convert Timestamps to Dates for the UI
      const uiFriendlyLoan = {
        ...loanData,
        date: (loanData.date as Timestamp).toDate(),
        installmentDetails: loanData.installmentDetails.map(inst => ({
          ...inst,
          dueDate: (inst.dueDate as Timestamp).toDate(),
          paidDate: inst.paidDate ? (inst.paidDate as Timestamp).toDate() : null,
        }))
      };
      setLocalLoan(uiFriendlyLoan);
    }
  }, [loanData]);

  const handleStatusChange = (installmentId: string, isPaid: boolean) => {
    setLocalLoan(prevLoan => {
      if (!prevLoan) return null;
      
      const newInstallmentDetails = prevLoan.installmentDetails.map(inst => {
        if (inst.id === installmentId) {
          return { ...inst, isPaid: isPaid, paidDate: isPaid ? new Date() : null };
        }
        return inst;
      });

      return { ...prevLoan, installmentDetails: newInstallmentDetails };
    });
  };

  const handleSaveChanges = () => {
    if (!localLoan || !loanDocRef) return;

    const paidCount = localLoan.installmentDetails.filter(inst => inst.isPaid).length;

    // Convert Dates back to Timestamps for Firestore
    const firestoreReadyLoan = {
      ...localLoan,
      paidInstallments: paidCount,
      date: Timestamp.fromDate(localLoan.date as Date),
      installmentDetails: localLoan.installmentDetails.map(inst => ({
        ...inst,
        dueDate: Timestamp.fromDate(inst.dueDate as Date),
        paidDate: inst.paidDate ? Timestamp.fromDate(inst.paidDate as Date) : null,
      })),
    };
    
    // Using non-blocking update
    setDocumentNonBlocking(loanDocRef, firestoreReadyLoan, { merge: true });
    router.back(); // Navigate back after initiating the save
  };

  if (isLoading || !localLoan) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }
  
  const progress = (localLoan.installmentDetails.filter(i => i.isPaid).length / localLoan.installments) * 100;
  const totalPaidInstallments = localLoan.installmentDetails.filter(i => i.isPaid).length;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{localLoan.description}</CardTitle>
          <CardDescription>
            {localLoan.borrower} deve a {localLoan.lender} | Empréstimo iniciado em {format(localLoan.date as Date, "dd/MM/yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-2 mb-6">
                <Progress value={progress} className="w-full h-3" />
                <span className="text-sm text-muted-foreground">
                    {totalPaidInstallments} de {localLoan.installments} parcelas pagas ({formatCurrency(localLoan.totalAmount)})
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
              {localLoan.installmentDetails.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell>
                    <Checkbox
                      checked={installment.isPaid}
                      onCheckedChange={(checked) => handleStatusChange(installment.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>{installment.installmentNumber}</TableCell>
                  <TableCell>{formatCurrency(installment.amount)}</TableCell>
                  <TableCell>{format(installment.dueDate as Date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>
                    {installment.paidDate ? format(installment.paidDate as Date, "dd/MM/yyyy", { locale: ptBR }) : 'Pendente'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Adicionar Parcela</Button>
            <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
