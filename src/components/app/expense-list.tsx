'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, Pencil, CircleDollarSign, CheckCircle, XCircle } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditPaymentDialog from './edit-payment-dialog';
import { useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function ExpenseList({ expenses, onDelete, isLoading }: ExpenseListProps) {
  const [editingPayment, setEditingPayment] = useState<Expense | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleUpdatePayment = (expense: Expense, isPaid: boolean, details: string) => {
    if (!firestore) return;

    const expenseDocRef = doc(firestore, 'couples', COUPLE_ID, 'expenses', expense.id);
    const updatedExpense = {
        ...expense,
        isPaid,
        paymentDetails: details,
    };
    
    // We need to convert Date objects back to Timestamps for Firestore
    if (updatedExpense.date instanceof Date) {
        updatedExpense.date = updatedExpense.date;
    }
    
    setDocumentNonBlocking(expenseDocRef, updatedExpense, { merge: true });
    toast({ title: 'Status do pagamento atualizado!' });
    setEditingPayment(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>Todas as despesas registradas no mês selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pago S/N</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pago por</TableHead>
                  <TableHead>Rateio</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma despesa registrada para este mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                       <TableCell>
                        {expense.isPaid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" title="Pago"/>
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" title="Não Pago"/>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(expense.date as Date, "dd/MM/yyyy", { locale: ptBR })} - <Badge variant="outline">{expense.category}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={expense.paidBy === 'Fabão' ? 'default' : 'secondary'}>
                            {expense.paidBy}
                        </Badge>
                      </TableCell>
                      <TableCell>
                          <Badge variant="outline">{expense.split}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" onClick={() => setEditingPayment(expense)}>
                            <CircleDollarSign className="h-4 w-4" />
                         </Button>
                         <Link href={`/expenses/${expense.id}`}>
                           <Button variant="ghost" size="icon" asChild>
                             <span><Pencil className="h-4 w-4" /></span>
                           </Button>
                         </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente a despesa
                                "{expense.description}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(expense.id)}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      {editingPayment && (
        <EditPaymentDialog
          expense={editingPayment}
          isOpen={!!editingPayment}
          onOpenChange={() => setEditingPayment(null)}
          onSave={handleUpdatePayment}
        />
      )}
    </>
  );
}
