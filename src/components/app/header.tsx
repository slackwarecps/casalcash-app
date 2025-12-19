'use client';

import { Landmark, PlusCircle, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { User } from '@/lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebaseApp } from '@/firebase';

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
  onMonthChange,
}: AppHeaderProps) {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };
  
  const monthName = format(selectedMonth, 'MMMM/yyyy', { locale: ptBR });
  const router = useRouter();
  const app = useFirebaseApp();

  const handleSignOut = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Landmark className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-headline font-bold">CasalCash</h1>
      </div>
      <div className="flex flex-col items-center gap-4 w-full md:w-auto">
        <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-40 text-center font-semibold capitalize">{monthName}</span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <ToggleGroup
            type="single"
            value={currentUser}
            onValueChange={(value: User) => value && onUserChange(value)}
            className="bg-card p-1 rounded-lg border w-full justify-around sm:w-auto"
          >
            <ToggleGroupItem value="Fabão" aria-label="Switch to Fabão" className="w-full">
              Fabão
            </ToggleGroupItem>
            <ToggleGroupItem value="Tati" aria-label="Switch to Tati" className="w-full">
              Tati
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={onAddExpense} className="w-full">
              <PlusCircle />
              Despesa
            </Button>
            <Button onClick={onAddLoan} variant="secondary" className="w-full">
              <PlusCircle />
              Empréstimo
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
