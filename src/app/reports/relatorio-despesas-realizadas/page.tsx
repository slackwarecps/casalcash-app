'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MonthlyExpensesReport from '@/components/app/monthly-expenses-report';
import type { Expense, SplitType, User } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function ReportsPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [paidByFilter, setPaidByFilter] = useState<User | 'all'>('all');
  const [splitTypeFilter, setSplitTypeFilter] = useState<SplitType | 'all'>('all');
  const [tipoDespesaFilter, setTipoDespesaFilter] = useState<'all' | 'pontual' | 'recorrente'>('all');

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const expensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'expenses');
  }, [firestore, user]);

  const { data: expenses, isLoading: isLoadingExpenses, forceRefetch } = useCollection<Expense>(expensesCollection);

  const handleDeleteExpense = (id: string, description: string) => {
    if (!firestore) return;
    const expenseDocRef = doc(firestore, 'couples', COUPLE_ID, 'expenses', id);
    deleteDocumentNonBlocking(expenseDocRef);
    toast({ title: "Despesa removida!", description: `"${description}" foi excluída.`, variant: "destructive" });
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: ptBR });

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return expenses
      .filter(exp => {
        const expDate = (exp.date as Timestamp).toDate();
        return isWithinInterval(expDate, { start, end });
      })
      .filter(exp => paidByFilter === 'all' || exp.paidBy === paidByFilter)
      .filter(exp => splitTypeFilter === 'all' || exp.split === splitTypeFilter)
      .filter(exp => tipoDespesaFilter === 'all' || exp.tipoDespesa === tipoDespesaFilter)
      .map(exp => ({
        ...exp,
        date: (exp.date as Timestamp).toDate()
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [expenses, selectedMonth, paidByFilter, splitTypeFilter, tipoDespesaFilter]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <Button variant="outline" onClick={() => router.push('/home-logada')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Home
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-32 sm:w-40 text-center font-medium capitalize">{monthName}</span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

       <Card className="mb-4">
        <CardHeader>
            <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paidByFilter">Pago por</Label>
              <Select value={paidByFilter} onValueChange={(value: User | 'all') => setPaidByFilter(value)}>
                <SelectTrigger id="paidByFilter"><SelectValue placeholder="Filtrar por pagador..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Pagadores</SelectItem>
                  <SelectItem value="Fabão">Fabão</SelectItem>
                  <SelectItem value="Tati">Tati</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label htmlFor="splitTypeFilter">Tipo de Rateio</Label>
               <Select value={splitTypeFilter} onValueChange={(value: SplitType | 'all') => setSplitTypeFilter(value)}>
                <SelectTrigger id="splitTypeFilter"><SelectValue placeholder="Filtrar por rateio..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Rateios</SelectItem>
                  <SelectItem value="50/50">50/50</SelectItem>
                  <SelectItem value="100% Fabão">100% Fabão</SelectItem>
                  <SelectItem value="100% Tati">100% Tati</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoDespesaFilter">Tipo de Despesa</Label>
              <Select value={tipoDespesaFilter} onValueChange={(value: 'all' | 'pontual' | 'recorrente') => setTipoDespesaFilter(value)}>
                <SelectTrigger id="tipoDespesaFilter"><SelectValue placeholder="Filtrar por tipo..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="pontual">Variável</SelectItem>
                  <SelectItem value="recorrente">Fixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </CardContent>
       </Card>
      
      <MonthlyExpensesReport 
        expenses={filteredExpenses} 
        isLoading={isLoadingExpenses}
        onDelete={handleDeleteExpense} 
      />

      <Link href="/expenses/new">
        <Button
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-8 w-8" />
          <span className="sr-only">Adicionar Despesa</span>
        </Button>
      </Link>
    </main>
  );
}
