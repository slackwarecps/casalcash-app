'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loan, User } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AddLoanDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLoan: (loan: Omit<Loan, 'id' | 'paidInstallments' | 'installmentDetails'>) => void;
}

const formSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }),
  totalAmount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  lender: z.enum(['Fabão', 'Tati']),
  borrower: z.enum(['Fabão', 'Tati']),
  installments: z.coerce.number().int().min(1, { message: 'Mínimo de 1 parcela.' }),
  date: z.date({
    errorMap: (issue, ctx) => ({ message: 'Data inválida. Use o formato DD/MM/AAAA.' }),
  }),
}).refine(data => data.lender !== data.borrower, {
  message: "Quem empresta e quem pega emprestado não podem ser a mesma pessoa.",
  path: ["borrower"],
});

export default function AddLoanDialog({ isOpen, onOpenChange, onAddLoan }: AddLoanDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      totalAmount: 0,
      lender: 'Fabão',
      borrower: 'Tati',
      installments: 1,
      date: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddLoan(values);
    form.reset();
    onOpenChange(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Empréstimo</DialogTitle>
          <DialogDescription>Registre um novo empréstimo ou compra parcelada entre o casal.</DialogDescription>
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
                    <Input placeholder="Ex: Notebook novo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nº de Parcelas</FormLabel>
                    <FormControl>
                        <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da despesa</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="DD/MM/AAAA"
                          className="pr-10"
                          {...{...field, value: field.value ? format(field.value, 'dd/MM/yyyy') : '',
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                              const date = parse(e.target.value, 'dd/MM/yyyy', new Date());
                              if (!isNaN(date.valueOf())) {
                                field.onChange(date);
                              }
                           }
                          }}
                          onBlur={(e) => {
                            const date = parse(e.target.value, 'dd/MM/yyyy', new Date());
                            if (!isNaN(date.valueOf())) {
                              field.onChange(date);
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" aria-label="Abrir calendário">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            locale={ptBR}
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="lender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem emprestou/pagou</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormField
                control={form.control}
                name="borrower"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem deve</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            
            <DialogFooter>
              <Button type="submit">Adicionar Empréstimo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
