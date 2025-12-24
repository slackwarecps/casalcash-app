'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Expense, Loan, User, Installment, RecurringExpense, PreCredit } from '@/lib/types';
import AppHeader from '@/components/app/header';
import Dashboard from '@/components/app/dashboard';
import ExpenseList from '@/components/app/expense-list';
import LoanList from '@/components/app/loan-list';
import AddLoanDialog from '@/components/app/add-loan-dialog';
import AddExpenseDialog from '@/components/app/add-expense-dialog';
import ApplyRecurringExpensesDialog from '@/components/app/apply-recurring-expenses-dialog';
import DeleteMonthDialog from '@/components/app/delete-month-dialog';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths, setDate, parse } from 'date-fns';
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
import { Loader2 } from 'lucide-react';
import AddPreCreditDialog from './add-pre-credit-dialog';
import PreCreditList from './pre-credit-list';
import VariableExpensesSummaryCard from './variable-expenses-summary-card';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function CasalCashApp() {
  const [currentUser, setCurrentUser] = useState<User>('Fabão');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isAddPreCreditDialogOpen, setIsAddPreCreditDialogOpen] = useState(false);
  const [editingPreCredit, setEditingPreCredit] = useState<PreCredit | null>(null);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isApplyRecurringDialogOpen, setIsApplyRecurringDialogOpen] = useState(false);
  const [isDeleteMonthDialogOpen, setIsDeleteMonthDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  // Firestore collections
  const expensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'expenses');
  }, [firestore, user]);
  
  const preCreditsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'preCredits');
  }, [firestore, user]);

  const loansCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'loans');
  }, [firestore, user]);

  const recurringExpensesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'couples', COUPLE_ID, 'recurringExpenses');
  }, [firestore, user]);

  const { data: expenses, isLoading: isLoadingExpenses, forceRefetch: refetchExpenses } = useCollection<Expense>(expensesCollection);
  const { data: preCredits, isLoading: isLoadingPreCredits } = useCollection<PreCredit>(preCreditsCollection);
  const { data: loans, isLoading: isLoadingLoans } = useCollection<Loan>(loansCollection);
  const { data: recurringExpenses, isLoading: isLoadingRecurringExpenses } = useCollection<RecurringExpense>(recurringExpensesCollection);

  const handleAddOrUpdatePreCredit = (creditData: Omit<PreCredit, 'id' | 'date'> & { id?: string, date: string }) => {
    if (!preCreditsCollection || !user?.uid) return;

    const parsedDate = parse(creditData.date, 'dd/MM/yyyy', new Date());

    if (creditData.id) {
      // Update
      const docRef = doc(preCreditsCollection, creditData.id);
      const updatedCredit = {
        ...creditData,
        date: Timestamp.fromDate(parsedDate),
      };
      delete updatedCredit.id; // Remove id before saving
      setDocumentNonBlocking(docRef, updatedCredit, { merge: true });
      toast({ title: "Pré-crédito atualizado!", description: `"${creditData.description}" foi salvo.` });
    } else {
      // Add
      const newCredit = {
        description: creditData.description,
        amount: creditData.amount,
        author: creditData.author,
        date: Timestamp.fromDate(parsedDate),
        members: { [user.uid]: 'owner' }
      };
      addDocumentNonBlocking(preCreditsCollection, newCredit);
      toast({ title: "Pré-crédito adicionado!", description: `"${newCredit.description}" foi registrado.` });
    }
  };

  const handleDeletePreCredit = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'couples', COUPLE_ID, 'preCredits', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Pré-crédito removido.", variant: "destructive" });
  };
  
  const handleOpenEditPreCreditDialog = (credit: PreCredit) => {
    setEditingPreCredit(credit);
    setIsAddPreCreditDialogOpen(true);
  };
  
  const handleOpenAddPreCreditDialog = () => {
    setEditingPreCredit(null);
    setIsAddPreCreditDialogOpen(true);
  };


  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'> & { date: string }) => {
    if (!expensesCollection || !user?.uid) return;

    const parsedDate = parse(expenseData.date, 'dd/MM/yyyy', new Date());

    const newExpense = {
      ...expenseData,
      date: Timestamp.fromDate(parsedDate),
      tipoDespesa: 'pontual' as const,
      isPaid: true,
      paymentDetails: '',
      members: { [user.uid]: 'owner' }
    };
    
    addDocumentNonBlocking(expensesCollection, newExpense);
    toast({ title: "Despesa adicionada!", description: `"${newExpense.description}" foi registrada.` });
  };

  const deleteExpense = (id: string) => {
    if (!firestore) return;
    const expenseDocRef = doc(firestore, 'couples', COUPLE_ID, 'expenses', id);
    deleteDocumentNonBlocking(expenseDocRef);
    toast({ title: "Despesa removida.", variant: "destructive" });
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'paidInstallments' | 'installmentDetails'>) => {
    if (!loansCollection || !firestore || !user?.uid) return;
    const newLoanId = doc(collection(firestore, 'temp')).id;
    const installmentAmount = loan.totalAmount / loan.installments;
    const installmentDetails: Installment[] = [];

    for (let i = 0; i < loan.installments; i++) {
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
    if (!firestore) return;
    const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', id);
    deleteDocumentNonBlocking(loanDocRef);
    toast({ title: "Empréstimo removido.", variant: "destructive" });
  };

  const handleApplyRecurring = async () => {
    if (!firestore || !user?.uid || !recurringExpenses || recurringExpenses.length === 0 || !expensesCollection) {
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
        members: { [user.uid as string]: 'owner' }
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
  
    const handleDeleteCurrentMonth = async () => {
    if (!firestore || !expensesCollection) return;

    setIsDeleting(true);
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    const expensesToDelete = (expenses || []).filter(exp => {
        const expDate = (exp.date as unknown as Timestamp).toDate();
        return isWithinInterval(expDate, { start, end });
    });

    if (expensesToDelete.length === 0) {
        toast({ title: "Nenhuma despesa para apagar", description: "O mês selecionado já está limpo."});
        setIsDeleting(false);
        setIsDeleteMonthDialogOpen(false);
        return;
    }

    const batch = writeBatch(firestore);
    expensesToDelete.forEach(expense => {
        const docRef = doc(expensesCollection, expense.id);
        batch.delete(docRef);
    });

    try {
        await batch.commit();
        toast({ title: "Mês zerado!", description: `Todas as ${expensesToDelete.length} despesas do mês foram removidas.` });
        if (refetchExpenses) {
            refetchExpenses();
        }
    } catch (error) {
        console.error("Erro ao apagar despesas do mês:", error);
        toast({ title: "Erro ao apagar", description: "Não foi possível remover as despesas do mês.", variant: "destructive" });
    } finally {
        setIsDeleting(false);
        setIsDeleteMonthDialogOpen(false);
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
  
  const filteredPreCredits = useMemo(() => {
    if (!preCredits) return [];
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return preCredits.filter(credit => {
      const creditDate = (credit.date as unknown as Timestamp).toDate();
      return isWithinInterval(creditDate, { start, end })
    });
  }, [preCredits, selectedMonth]);

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
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredExpenses]);
  
  const preCreditsWithDateObjects = useMemo(() => {
    return (filteredPreCredits || []).map(credit => ({
      ...credit,
      date: (credit.date as unknown as Timestamp).toDate()
    }));
  }, [filteredPreCredits]);


  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <AppHeader
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onAddExpense={() => setIsAddExpenseDialogOpen(true)}
        onAddLoan={() => setIsLoanDialogOpen(true)}
        onAddPreCredit={handleOpenAddPreCreditDialog}
        onApplyRecurring={() => setIsApplyRecurringDialogOpen(true)}
        onDeleteCurrentMonth={() => setIsDeleteMonthDialogOpen(true)}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <div className="grid grid-cols-1 gap-8">
        <Dashboard 
          expenses={expensesWithDateObjects}
          preCredits={preCreditsWithDateObjects}
          loans={loansWithDateObjects} 
          currentUser={currentUser} 
          selectedMonth={selectedMonth}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ExpenseList expenses={expensesWithDateObjects} onDelete={deleteExpense} isLoading={isLoadingExpenses} />
          <div className="flex flex-col gap-8">
            <LoanList loans={loansWithDateObjects} onPayInstallment={payInstallment} onDelete={deleteLoan} isLoading={isLoadingLoans} />
            <VariableExpensesSummaryCard expenses={expensesWithDateObjects} />
          </div>
        </div>
         <PreCreditList
            preCredits={preCreditsWithDateObjects}
            onEdit={handleOpenEditPreCreditDialog}
            onDelete={handleDeletePreCredit}
            isLoading={isLoadingPreCredits}
          />
      </div>
      
      <AddExpenseDialog
        isOpen={isAddExpenseDialogOpen}
        onOpenChange={setIsAddExpenseDialogOpen}
        onAdd={addExpense}
      />
      <AddLoanDialog
        isOpen={isLoanDialogOpen}
        onOpenChange={setIsLoanDialogOpen}
        onAddLoan={addLoan}
      />
       <AddPreCreditDialog
        isOpen={isAddPreCreditDialogOpen}
        onOpenChange={setIsAddPreCreditDialogOpen}
        onSave={handleAddOrUpdatePreCredit}
        preCredit={editingPreCredit}
        selectedMonth={selectedMonth}
      />
      <ApplyRecurringExpensesDialog
        isOpen={isApplyRecurringDialogOpen}
        onOpenChange={setIsApplyRecurringDialogOpen}
        onConfirm={handleApplyRecurring}
        selectedMonth={selectedMonth}
      />
       <DeleteMonthDialog
        isOpen={isDeleteMonthDialogOpen}
        onOpenChange={setIsDeleteMonthDialogOpen}
        onConfirm={handleDeleteCurrentMonth}
        selectedMonth={selectedMonth}
        isLoading={isDeleting}
      />
    </div>
  );
}
