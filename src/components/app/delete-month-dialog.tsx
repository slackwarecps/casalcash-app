'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface DeleteMonthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  selectedMonth: Date;
  isLoading: boolean;
}

export default function DeleteMonthDialog({ isOpen, onOpenChange, onConfirm, selectedMonth, isLoading }: DeleteMonthDialogProps) {
  const monthName = format(selectedMonth, 'MMMM \'de\' yyyy', { locale: ptBR });

  const handleConfirm = () => {
    onConfirm();
    // The dialog will be closed by the parent component after the operation.
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apagar Despesas do Mês</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja apagar TODAS as despesas do mês de <span className="font-bold capitalize">{monthName}</span>?
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-destructive">
          Atenção: Esta ação não pode ser desfeita. Todos os lançamentos de despesas para este mês serão permanentemente removidos.
        </p>
        <DialogFooter className="sm:justify-start">
            <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sim, apagar
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Não
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
