'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { categories } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

const formSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  paidBy: z.enum(['Fabão', 'Tati']),
  split: z.enum(['50/50', '100% Fabão', '100% Tati']),
  category: z.enum(categories),
  date: z.date({
    errorMap: (issue, ctx) => ({ message: 'Data inválida. Use o formato DD/MM/AAAA.' }),
  }),
  tipoDespesa: z.enum(['pontual', 'recorrente']),
});

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const expenseDocRef = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return doc(firestore, 'couples', COUPLE_ID, 'expenses', id as string);
  }, [firestore, id]);

  const { data: expenseData, isLoading: isLoadingExpense } = useDoc<Expense>(expenseDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      paidBy: 'Fabão',
      split: '50/50',
      category: 'Outros',
      date: new Date(),
      tipoDespesa: 'pontual',
    }
  });

  useEffect(() => {
    if (expenseData) {
      form.reset({
        ...expenseData,
        date: (expenseData.date as Timestamp).toDate(),
        tipoDespesa: expenseData.tipoDespesa || 'pontual',
      });
    }
  }, [expenseData, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!expenseDocRef || !expenseData) return;

    const updatedExpense = {
        ...expenseData, // preserve original data like members
        ...values,
        date: Timestamp.fromDate(values.date),
    };

    setDocumentNonBlocking(expenseDocRef, updatedExpense, { merge: true });
    toast({ title: 'Despesa atualizada!', description: `"${values.description}" foi salva.` });
    router.back();
  };

  if (isLoadingExpense || !expenseData) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Editar Despesa</CardTitle>
          <CardDescription>Altere os detalhes do gasto e salve.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jantar no restaurante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da despesa</FormLabel>
                     <div className="relative">
                      <FormControl>
                          <Input
                            {...field}
                            value={field.value ? format(field.value, 'dd/MM/yyyy') : ''}
                            onChange={(e) => {
                                const date = parse(e.target.value, 'dd/MM/yyyy', new Date());
                                if (!isNaN(date.getTime())) {
                                    field.onChange(date);
                                }
                            }}
                            placeholder="DD/MM/AAAA"
                            className="pr-10"
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
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pago por</FormLabel>
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
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tipoDespesa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Despesa</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="pontual" /></FormControl>
                          <FormLabel className="font-normal">Variável (Pontual)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="recorrente" /></FormControl>
                          <FormLabel className="font-normal">Fixa (Recorrente)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="split"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Divisão da Despesa</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="50/50" /></FormControl>
                          <FormLabel className="font-normal">50/50 (Dividido)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="100% Fabão" /></FormControl>
                          <FormLabel className="font-normal">100% Fabão</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="100% Tati" /></FormControl>
                          <FormLabel className="font-normal">100% Tati</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
