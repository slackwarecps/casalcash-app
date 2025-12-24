'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, PlusCircle, Trash2, Pencil } from 'lucide-react';
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
import { useCollection, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { RecurringExpense } from '@/lib/types';
import AddRecurringExpenseDialog from '@/components/app/add-recurring-expense-dialog';
import { useToast } from '@/hooks/use-toast';

const COUPLE_ID = 'casalUnico';

export default function RecurringExpensesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const recurringExpensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'recurringExpenses');
  }, [firestore, user]);

  const { data: recurringExpenses, isLoading } = useCollection<RecurringExpense>(recurringExpensesCollection);

  const handleAdd = (expenseData: Omit<RecurringExpense, 'id'>) => {
    if (!recurringExpensesCollection || !user?.uid) return;
    const newRecurringExpense = {
        ...expenseData,
        members: { [user.uid]: 'owner' }
    };
    addDocumentNonBlocking(recurringExpensesCollection, newRecurringExpense);
    toast({ title: "Despesa recorrente adicionada!", description: `"${expenseData.description}" foi registrada.` });
  };
  
  const handleDelete = (id: string) => {
    if(!firestore) return;
    const docRef = doc(firestore, 'couples', COUPLE_ID, 'recurringExpenses', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Despesa recorrente removida.", variant: "destructive" });
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.push('/home-logada')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle>Despesas Recorrentes</CardTitle>
                <CardDescription>Gerencie as despesas que se repetem todos os meses.</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Recorrente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago por</TableHead>
                <TableHead>Rateio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : recurringExpenses && recurringExpenses.length > 0 ? (
                recurringExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.dayOfMonth}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={expense.paidBy === 'Fabão' ? 'default' : 'secondary'}>
                        {expense.paidBy}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{expense.split}</Badge></TableCell>
                    <TableCell className="text-right">
                       <Link href={`/recurring-expenses/${expense.id}`}>
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a despesa recorrente "{expense.description}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(expense.id)}>Deletar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma despesa recorrente encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddRecurringExpenseDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAdd={handleAdd} />
    </main>
  );
}
