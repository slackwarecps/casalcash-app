'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Expense, Loan, User, Installment } from '@/lib/types';
import AppHeader from '@/components/app/header';
import Dashboard from '@/components/app/dashboard';
import ExpenseList from '@/components/app/expense-list';
import LoanList from '@/components/app/loan-list';
import AddExpenseDialog from '@/components/app/add-expense-dialog';
import AddLoanDialog from '@/components/app/add-loan-dialog';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import {
  useFirestore,
  useAuth,
  useUser,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  initiateAnonymousSignIn,
} from '@/firebase';
import { collection, query, where, doc, Timestamp, getDoc, setDoc } from 'firebase/firestore';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

export default function CasalCashApp() {
  const [currentUser, setCurrentUser] = useState<User>('Fabão');
  const [selectedMonth, setSelectedMonth] = useState(new Date('2025-10-01T12:00:00Z'));
  const [preCreditBalance, setPreCreditBalance] = useState(2330.00);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Automatically sign in anonymously if no user is logged in
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  // Ensure the couple document exists for security rules
  useEffect(() => {
    if (!user || !firestore) return;

    const coupleDocRef = doc(firestore, 'couples', COUPLE_ID);
    
    const ensureCoupleDoc = async () => {
      const docSnap = await getDoc(coupleDocRef);
      if (!docSnap.exists()) {
        try {
          // Create the document with the current user as a member
          await setDoc(coupleDocRef, {
            members: {
              [user.uid]: 'owner'
            }
          });
        } catch (e) {
          console.error("Error creating couple document:", e);
        }
      }
    };

    ensureCoupleDoc();

  }, [user, firestore]);

  // Firestore collections
  const expensesCollection = useMemoFirebase(() => {
    if (!user) return null; // Wait for user to be authenticated
    return collection(firestore, 'couples', COUPLE_ID, 'expenses');
  }, [firestore, user]);

  const loansCollection = useMemoFirebase(() => {
    if (!user) return null; // Wait for user to be authenticated
    return collection(firestore, 'couples', COUPLE_ID, 'loans');
  }, [firestore, user]);

  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesCollection);
  const { data: loans, isLoading: isLoadingLoans } = useCollection<Loan>(loansCollection);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    if (!expensesCollection || !user) return;
    const newExpense = { 
      ...expense, 
      date: Timestamp.fromDate(expense.date as Date),
      members: { [user.uid]: 'owner' } // Add members for security rules
    };
    addDocumentNonBlocking(expensesCollection, newExpense);
    toast({ title: "Despesa adicionada!", description: `"${newExpense.description}" foi registrada.` });
  };

  const deleteExpense = (id: string) => {
    const expenseDocRef = doc(firestore, 'couples', COUPLE_ID, 'expenses', id);
    deleteDocumentNonBlocking(expenseDocRef);
    toast({ title: "Despesa removida.", variant: "destructive" });
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'paidInstallments' | 'installmentDetails'>) => {
    if (!loansCollection || !user) return;
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
       members: { [user.uid]: 'owner' } // Add members for security rules
    };
    
    const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', newLoanId);
    setDocumentNonBlocking(loanDocRef, newLoan, { merge: false });

    toast({ title: "Empréstimo adicionado!", description: `"${newLoan.description}" foi registrado.` });
  };

  const payInstallment = (loanId: string) => {
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
    const loanDocRef = doc(firestore, 'couples', COUPLE_ID, 'loans', id);
    deleteDocumentNonBlocking(loanDocRef);
    toast({ title: "Empréstimo removido.", variant: "destructive" });
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
        <Dashboard 
          expenses={expensesWithDateObjects} 
          loans={loansWithDateObjects} 
          currentUser={currentUser} 
          selectedMonth={selectedMonth}
          preCreditBalance={preCreditBalance}
          onPreCreditBalanceChange={setPreCreditBalance}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseList expenses={expensesWithDateObjects} onDelete={deleteExpense} isLoading={isLoadingExpenses || isUserLoading} />
          <LoanList loans={loansWithDateObjects} onPayInstallment={payInstallment} onDelete={deleteLoan} isLoading={isLoadingLoans || isUserLoading} />
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
