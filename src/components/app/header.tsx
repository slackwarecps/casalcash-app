'use client';

import { Landmark, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { User } from '@/lib/types';

interface AppHeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onAddExpense: () => void;
  onAddLoan: () => void;
}

export default function AppHeader({
  currentUser,
  onUserChange,
  onAddExpense,
  onAddLoan,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Landmark className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-headline font-bold">CasalCash</h1>
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
    </header>
  );
}
