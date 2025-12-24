'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MonthlyExpensesReport from '@/components/app/monthly-expenses-report';
import type { Expense } from '@/lib/types';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function ReportsPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const firestore = useFirestore();
  const { user } = useUser();

  const expensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'expenses');
  }, [firestore, user]);

  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesCollection);

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
      .map(exp => ({
        ...exp,
        date: (exp.date as Timestamp).toDate()
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [expenses, selectedMonth]);

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
      
      <MonthlyExpensesReport expenses={filteredExpenses} isLoading={isLoadingExpenses} />
    </main>
  );
}
