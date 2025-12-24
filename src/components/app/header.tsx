"use client"

import { Landmark, PlusCircle, ChevronLeft, ChevronRight, LogOut, Repeat, CheckCircle, Trash2, PiggyBank, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { User } from '@/lib/types';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebaseApp } from '@/firebase';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onAddExpense: () => void;
  onAddLoan: () => void;
  onAddPreCredit: () => void;
  onApplyRecurring: () => void;
  onDeleteCurrentMonth: () => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function AppHeader({
  currentUser,
  onUserChange,
  onAddExpense,
  onAddLoan,
  onAddPreCredit,
  onApplyRecurring,
  onDeleteCurrentMonth,
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
      <div className="flex items-center gap-3 self-start md:self-center">
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
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAddExpense}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Adicionar Despesa</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddPreCredit}>
              <PiggyBank className="mr-2 h-4 w-4" />
              <span>Adicionar Pré-Crédito</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddLoan}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Adicionar Empréstimo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>
             <DropdownMenuSeparator />
            <Link href="/recurring-expenses">
              <DropdownMenuItem>
                <Repeat className="mr-2 h-4 w-4" />
                <span>Cadastro de Recorrentes</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={onApplyRecurring}>
               <CheckCircle className="mr-2 h-4 w-4" />
              <span>Aplicar Recorrentes</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteCurrentMonth} className="text-destructive">
               <Trash2 className="mr-2 h-4 w-4" />
              <span>Apagar Despesas do Mês</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="text-muted-foreground" />
          <span className="sr-only">Sair</span>
        </Button>
      </div>
    </header>
  );
}
