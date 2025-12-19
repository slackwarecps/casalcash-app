'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EditPaymentDialogProps {
  expense: Expense;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (expense: Expense, isPaid: boolean, details: string) => void;
}

const formSchema = z.object({
  isPaid: z.boolean(),
  paymentDetails: z.string().optional(),
});

export default function EditPaymentDialog({ expense, isOpen, onOpenChange, onSave }: EditPaymentDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPaid: expense.isPaid || false,
      paymentDetails: expense.paymentDetails || '',
    },
  });
  
  useEffect(() => {
    form.reset({
      isPaid: expense.isPaid || false,
      paymentDetails: expense.paymentDetails || '',
    });
  }, [expense, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(expense, values.isPaid, values.paymentDetails || '');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Alterar status de pagamento para: <span className="font-bold">"{expense.description}"</span> no valor de <span className="font-bold">{formatCurrency(expense.amount)}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Despesa Paga?</FormLabel>
                     <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes do Pagamento (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: pago do dia 17/12/2025 as 17:23 usando pix da conta do itau do Fabio."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
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
