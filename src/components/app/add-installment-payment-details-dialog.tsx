'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Installment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AddInstallmentPaymentDetailsDialogProps {
  installment: Installment;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (installmentId: string, details: string) => void;
}

const formSchema = z.object({
  paymentDetails: z.string().min(1, "Por favor, adicione um detalhe sobre o pagamento."),
});

export default function AddInstallmentPaymentDetailsDialog({ installment, isOpen, onOpenChange, onSave }: AddInstallmentPaymentDetailsDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentDetails: '',
    },
  });
  
  useEffect(() => {
    form.reset({
      paymentDetails: installment.paymentDetails || '',
    });
  }, [installment, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(installment.id, values.paymentDetails);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Detalhes do Pagamento</DialogTitle>
          <DialogDescription>
            Parcela {installment.installmentNumber} no valor de {formatCurrency(installment.amount)}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes do Pagamento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: pago usando pix da conta do itau do Fabio."
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
                Confirmar Pagamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
