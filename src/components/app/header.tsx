"use client"

import { Landmark, PlusCircle, ChevronLeft, ChevronRight, LogOut, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { User } from '@/lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebaseApp } from '@/firebase';
import Link from 'next/link';

interface AppHeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onAddExpense: () => void;
  onAddLoan: () => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function AppHeader({
  currentUser,
  onUserChange,
  onAddExpense,
  onAddLoan,
  selectedMonth,
  onMonthChange
}: AppHeaderProps) {
  const firebaseApp = useFirebaseApp();
  const router = useRouter();

  const handleLogout = async () => {
    if(!firebaseApp) return;
    const auth = getAuth(firebaseApp);
    await signOut(auth);
    router.push('/login');
  };
  
  const handlePreviousMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };
  
  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: ptBR });

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-card border shadow-sm">
      <div className="flex items-center gap-3 self-center">
        <Landmark className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-headline font-bold">CasalCash</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="w-32 sm:w-40 text-center font-medium capitalize">{monthName}</span>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onAddExpense}>
          <PlusCircle />
          Gasto
        </Button>
        <Button onClick={onAddLoan} variant="secondary">
          <PlusCircle />
          Empréstimo
        </Button>
         <Link href="/recurring-expenses">
          <Button variant="secondary">
            <Repeat />
            Recorrentes
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
}
