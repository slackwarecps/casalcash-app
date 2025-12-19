'use client';

import { useState, useMemo } from 'react';
import { initialExpenses, initialLoans } from '@/lib/data';
import type { Expense, Loan, User } from '@/lib/types';
import AppHeader from '@/components/app/header';
import Dashboard from '@/components/app/dashboard';
import ExpenseList from '@/components/app/expense-list';
import LoanList from '@/components/app/loan-list';
import AddExpenseDialog from '@/components/app/add-expense-dialog';
import AddLoanDialog from '@/components/app/add-loan-dialog';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function CasalCashApp() {
  const [currentUser, setCurrentUser] = useState<User>('Fabão');
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    toast({ title: "Despesa adicionada!", description: `"${newExpense.description}" foi registrada.` });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({ title: "Despesa removida.", variant: "destructive" });
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'paidInstallments'>) => {
    const newLoan = { ...loan, id: Date.now().toString(), paidInstallments: 0 };
    setLoans(prev => [newLoan, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    toast({ title: "Empréstimo adicionado!", description: `"${newLoan.description}" foi registrado.` });
  };

  const payInstallment = (id: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === id && loan.paidInstallments < loan.installments) {
        toast({ title: "Parcela paga!", description: `Uma parcela de "${loan.description}" foi paga.` });
        return { ...loan, paidInstallments: loan.paidInstallments + 1 };
      }
      return loan;
    }));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
    toast({ title: "Empréstimo removido.", variant: "destructive" });
  };

  const filteredExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return expenses.filter(exp => isWithinInterval(exp.date, { start, end }));
  }, [expenses, selectedMonth]);

  // Loans are not filtered by month to show their progress over time.

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AppHeader
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onAddExpense={() => setIsExpenseDialogOpen(true)}
        onAddLoan={() => setIsLoanDialogOpen(true)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        <Dashboard expenses={filteredExpenses} loans={loans} currentUser={currentUser} selectedMonth={selectedMonth} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />
          <LoanList loans={loans} onPayInstallment={payInstallment} onDelete={deleteLoan} />
        </div>
      </div>

      <AddExpenseDialog
        isOpen={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onAddExpense={addExpense}
      />
      <AddLoanDialog
        isOpen={isLoanDialogOpen}
        onOpenChange={setIsLoanDialogOpen}
        onAddLoan={addLoan}
      />
    </div>
  );
}
