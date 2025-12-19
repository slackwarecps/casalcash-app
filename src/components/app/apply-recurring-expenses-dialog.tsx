'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ApplyRecurringExpensesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  selectedMonth: Date;
}

export default function ApplyRecurringExpensesDialog({ isOpen, onOpenChange, onConfirm, selectedMonth }: ApplyRecurringExpensesDialogProps) {
  const monthName = format(selectedMonth, 'MMMM \'de\' yyyy', { locale: ptBR });

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aplicar Despesas Recorrentes</DialogTitle>
          <DialogDescription>
            Você confirma o lançamento de todas as despesas recorrentes para o mês de <span className="font-bold capitalize">{monthName}</span>?
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Esta ação irá criar novas despesas no mês selecionado com base nas suas despesas recorrentes cadastradas.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar Lançamentos</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
