'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Expense, Loan, User, Installment, RecurringExpense } from '@/lib/types';
import AppHeader from '@/components/app/header';
import Dashboard from '@/components/app/dashboard';
import ExpenseList from '@/components/app/expense-list';
import LoanList from '@/components/app/loan-list';
import AddExpenseDialog from '@/components/app/add-expense-dialog';
import AddLoanDialog from '@/components/app/add-loan-dialog';
import ApplyRecurringExpensesDialog from '@/components/app/apply-recurring-expenses-dialog';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths, setDate } from 'date-fns';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function CasalCashApp() {
  const [currentUser, setCurrentUser] = useState<User>('Fabão');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [preCreditBalance, setPreCreditBalance] = useState(2330.00);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isApplyRecurringDialogOpen, setIsApplyRecurringDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  // Firestore collections
  const expensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'expenses');
  }, [firestore, user]);

  const loansCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'loans');
  }, [firestore, user]);
  
  const recurringExpensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'recurringExpenses');
  }, [firestore, user]);

  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesCollection);
  const { data: loans, isLoading: isLoadingLoans } = useCollection<Loan>(loansCollection);
  const { data: recurringExpenses, isLoading: isLoadingRecurringExpenses } = useCollection<RecurringExpense>(recurringExpensesCollection);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    if (!expensesCollection || !user?.uid) return;
    const newExpense = { 
      ...expense, 
      date: Timestamp.fromDate(expense.date as Date),
      members: { [user.uid]: 'owner' }
    };
    addDocumentNonBlocking(expensesCollection, newExpense);
    toast({ title: "Despesa adicionada!", description: `"${newExpense.description}" foi registrada.` });
  };

  const deleteExpense = (id: string) => {
    if(!firestore) return;
    const expenseDocRef = doc(firestore, 'couples', COUPLE_ID, 'expenses', id);
    deleteDocumentNonBlocking(expenseDocRef);
    toast({ title: "Despesa removida.", variant: "destructive" });
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'paidInstallments' | 'installmentDetails'>) => {
    if (!loansCollection || !firestore || !user?.uid) return;
    const newLoanId = doc(collection(firestore, 'temp')).id;
    const installmentAmount = loan.totalAmount / loan.installments;
    const installmentDetails: Installment[] = [];
    
    for(let i=0; i<loan.installments; i++) {
      installmentDetails.push({
        id: doc(collection(firestore, 'temp')).id,
        loanId: newLoanId,
        installmentNumber: i + 1,
        amount: installmentAmount,
        dueDate: Timestamp.fromDate(addMonths(loan.date as Date, i)),
        isPaid: false,
        paidDate: null,
      });
    }

    const newLoan: Loan = {
       ...loan, 
       id: newLoanId, 
       paidInstallments: 0,
       installmentDetails,
       date: Timestamp.fromDate(loan.date as Date),
       members: { [user.uid]: 'owner' }
    };
    
    const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', newLoanId);
    setDocumentNonBlocking(loanDocRef, newLoan, { merge: false });

    toast({ title: "Empréstimo adicionado!", description: `"${newLoan.description}" foi registrado.` });
  };

  const payInstallment = (loanId: string) => {
    if (!firestore || !loans) return;
    const loan = loans?.find(l => l.id === loanId);
    if (loan) {
      const firstUnpaidInstallment = loan.installmentDetails.find(inst => !inst.isPaid);
      if (firstUnpaidInstallment) {
        const updatedInstallments = loan.installmentDetails.map(inst =>
          inst.id === firstUnpaidInstallment!.id ? { ...inst, isPaid: true, paidDate: Timestamp.now() } : inst
        );
        const paidCount = updatedInstallments.filter(i => i.isPaid).length;
        
        const updatedLoan = { ...loan, installmentDetails: updatedInstallments, paidInstallments: paidCount };
        const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', loanId);
        setDocumentNonBlocking(loanDocRef, updatedLoan, { merge: true });

        toast({ title: "Parcela paga!", description: `Uma parcela de "${loan.description}" foi paga.` });
      }
    }
  };

  const deleteLoan = (id: string) => {
    if(!firestore) return;
    const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', id);
    deleteDocumentNonBlocking(loanDocRef);
    toast({ title: "Empréstimo removido.", variant: "destructive" });
  };

  const handleApplyRecurring = async () => {
    if (!firestore || !user?.uid || !recurringExpenses || recurringExpenses.length === 0) {
      toast({
        title: "Nenhuma despesa recorrente para aplicar",
        description: "Cadastre despesas recorrentes primeiro.",
        variant: "destructive",
      });
      return;
    }

    const batch = writeBatch(firestore);
    let count = 0;

    recurringExpenses.forEach(recExpense => {
      const expenseDate = setDate(selectedMonth, recExpense.dayOfMonth);
      
      const newExpense: Omit<Expense, 'id'> = {
        description: recExpense.description,
        amount: recExpense.amount,
        paidBy: recExpense.paidBy,
        split: recExpense.split,
        category: recExpense.category,
        date: Timestamp.fromDate(expenseDate),
        tipoDespesa: 'recorrente',
        members: { [user.uid]: 'owner' }
      };

      const newExpenseRef = doc(expensesCollection);
      batch.set(newExpenseRef, newExpense);
      count++;
    });

    try {
      await batch.commit();
      toast({
        title: "Despesas recorrentes aplicadas!",
        description: `${count} despesas foram lançadas para o mês selecionado.`,
      });
    } catch (error) {
      console.error("Erro ao aplicar despesas recorrentes:", error);
      toast({
        title: "Erro ao aplicar despesas",
        description: "Não foi possível lançar as despesas recorrentes.",
        variant: "destructive",
      });
    }
  };
  
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return expenses.filter(exp => {
      const expDate = (exp.date as unknown as Timestamp).toDate();
      return isWithinInterval(expDate, { start, end })
    });
  }, [expenses, selectedMonth]);

  const loansWithDateObjects = useMemo(() => {
    return (loans || []).map(loan => ({
      ...loan,
      date: (loan.date as unknown as Timestamp).toDate(),
      installmentDetails: loan.installmentDetails.map(inst => ({
        ...inst,
        dueDate: (inst.dueDate as unknown as Timestamp).toDate(),
        paidDate: inst.paidDate ? (inst.paidDate as unknown as Timestamp).toDate() : null,
      }))
    }));
  }, [loans]);

  const expensesWithDateObjects = useMemo(() => {
    return (filteredExpenses || []).map(exp => ({
      ...exp,
      date: (exp.date as unknown as Timestamp).toDate()
    }));
  }, [filteredExpenses]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <AppHeader
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onAddExpense={() => setIsExpenseDialogOpen(true)}
        onAddLoan={() => setIsLoanDialogOpen(true)}
        onApplyRecurring={() => setIsApplyRecurringDialogOpen(true)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <div className="grid grid-cols-1 gap-8">
        <Dashboard 
          expenses={expensesWithDateObjects} 
          loans={loansWithDateObjects} 
          currentUser={currentUser} 
          selectedMonth={selectedMonth}
          preCreditBalance={preCreditBalance}
          onPreCreditBalanceChange={setPreCreditBalance}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList expenses={expensesWithDateObjects} onDelete={deleteExpense} isLoading={isLoadingExpenses} />
          <LoanList loans={loansWithDateObjects} onPayInstallment={payInstallment} onDelete={deleteLoan} isLoading={isLoadingLoans} />
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
      <ApplyRecurringExpensesDialog
        isOpen={isApplyRecurringDialogOpen}
        onOpenChange={setIsApplyRecurringDialogOpen}
        onConfirm={handleApplyRecurring}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
