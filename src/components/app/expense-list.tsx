'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, Pencil, CircleDollarSign, CheckCircle, XCircle } from 'lucide-react';
import type { Expense, User, SplitType } from '@/lib/types';
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
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

const ExpenseTable = ({ expenses, onDelete, onEditPayment }: { expenses: Expense[], onDelete: (id: string) => void, onEditPayment: (expense: Expense) => void }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const paginatedExpenses = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page
    };
    
    return (
        <>
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
                        {paginatedExpenses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                            Nenhuma despesa encontrada para esta seleção.
                            </TableCell>
                        </TableRow>
                        ) : (
                        paginatedExpenses.map((expense) => (
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
                                <div className="text-sm text-muted-foreground flex flex-wrap gap-1 items-center">
                                <span>{format(expense.date as Date, "dd/MM/yyyy", { locale: ptBR })} -</span>
                                <Badge variant="outline">{expense.category}</Badge>
                                <Badge variant={expense.tipoDespesa === 'recorrente' ? 'destructive' : 'secondary'} className="capitalize">
                                    {expense.tipoDespesa === 'recorrente' ? 'Fixa' : 'Variável'}
                                </Badge>
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
                            <TableCell className="text-right whitespace-nowrap">
                                <Button variant="ghost" size="icon" onClick={() => onEditPayment(expense)}>
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
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Itens por pág:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Próximo
                </Button>
                </div>
            </div>
        </>
    )
}

export default function ExpenseList({ expenses, onDelete, isLoading }: ExpenseListProps) {
  const [editingPayment, setEditingPayment] = useState<Expense | null>(null);
  const [paidByFilter, setPaidByFilter] = useState<User | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  
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
    
    if (updatedExpense.date instanceof Date) {
        updatedExpense.date = updatedExpense.date;
    }
    
    setDocumentNonBlocking(expenseDocRef, updatedExpense, { merge: true });
    toast({ title: 'Status do pagamento atualizado!' });
    setEditingPayment(null);
  };
  
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => paidByFilter === 'all' || expense.paidBy === paidByFilter)
      .filter(expense => {
        if (statusFilter === 'all') return true;
        return statusFilter === 'paid' ? expense.isPaid : !expense.isPaid;
      });
  }, [expenses, paidByFilter, statusFilter]);

  const geralExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.split === '50/50' && e.tipoDespesa === 'pontual');
  }, [filteredExpenses]);

  const tatiExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.paidBy === 'Tati' && e.tipoDespesa === 'pontual');
  }, [filteredExpenses]);

  const fabaoExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.paidBy === 'Fabão' && e.tipoDespesa === 'pontual');
  }, [filteredExpenses]);
  
  const fixedExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.tipoDespesa === 'recorrente');
  }, [filteredExpenses]);

  const fabaoTotal = useMemo(() => {
    return fabaoExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [fabaoExpenses]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>
            {isLoading ? 'Carregando despesas...' : `Encontrado ${expenses.length} despesas no mês.`}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Select value={paidByFilter} onValueChange={(value: User | 'all') => setPaidByFilter(value)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por pessoa..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Fabão">Fabão</SelectItem>
                <SelectItem value="Tati">Tati</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'paid' | 'unpaid') => setStatusFilter(value)}>
              <SelectTrigger><SelectValue placeholder="Filtrar por status..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="unpaid">Não Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="geral">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="geral">Geral (50/50)</TabsTrigger>
                    <TabsTrigger value="adicionais-tati">Adicionais Tati</TabsTrigger>
                    <TabsTrigger value="adicionais-fabao">Adicionais Fabão</TabsTrigger>
                    <TabsTrigger value="fixas">Fixas</TabsTrigger>
                </TabsList>
                <TabsContent value="geral" className="mt-4">
                     <ExpenseTable expenses={geralExpenses} onDelete={onDelete} onEditPayment={setEditingPayment} />
                </TabsContent>
                <TabsContent value="adicionais-tati" className="mt-4">
                    <ExpenseTable expenses={tatiExpenses} onDelete={onDelete} onEditPayment={setEditingPayment} />
                </TabsContent>
                <TabsContent value="adicionais-fabao" className="mt-4">
                    <ExpenseTable expenses={fabaoExpenses} onDelete={onDelete} onEditPayment={setEditingPayment} />
                    <CardFooter className="pt-6 justify-end">
                        <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Variáveis Fabão</p>
                        <p className="text-lg font-bold">{formatCurrency(fabaoTotal)}</p>
                        </div>
                    </CardFooter>
                </TabsContent>
                <TabsContent value="fixas" className="mt-4">
                    <ExpenseTable expenses={fixedExpenses} onDelete={onDelete} onEditPayment={setEditingPayment} />
                </TabsContent>
            </Tabs>
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
