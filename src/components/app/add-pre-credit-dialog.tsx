'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PreCredit } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface AddPreCreditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (credit: Omit<PreCredit, 'id' | 'date'> & { id?: string, date: string }) => void;
  preCredit: PreCredit | null;
  selectedMonth: Date;
}

const formSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  author: z.enum(['Fabão', 'Tati']),
  date: z.string().refine(val => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "Data deve estar no formato dd/mm/yyyy",
  }),
});

export default function AddPreCreditDialog({ isOpen, onOpenChange, onSave, preCredit, selectedMonth }: AddPreCreditDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      author: 'Tati',
      date: format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'dd/MM/yyyy'),
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (preCredit) {
        form.reset({
          description: preCredit.description,
          amount: preCredit.amount,
          author: preCredit.author,
          date: (preCredit.date as Timestamp).toDate().toLocaleDateString('pt-BR'),
        });
      } else {
        form.reset({
          description: '',
          amount: 0,
          author: 'Tati',
          date: format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'dd/MM/yyyy'),
        });
      }
    }
  }, [preCredit, form, isOpen, selectedMonth]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSave = {
      ...values,
      id: preCredit?.id,
    };
    onSave(dataToSave);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{preCredit ? 'Editar' : 'Adicionar'} Pré-Crédito</DialogTitle>
          <DialogDescription>
            {preCredit ? 'Altere os detalhes do pré-crédito.' : 'Registre um novo adiantamento.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Adiantamento para despesas do mês" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fabão">Fabão</SelectItem>
                        <SelectItem value="Tati">Tati</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Crédito</FormLabel>
                    <FormControl>
                       <Input placeholder="dd/mm/yyyy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
