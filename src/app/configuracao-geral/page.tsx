'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDoc, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Configuration } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const CONFIG_ID = 'validEmails';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

function ConfiguracaoGeralPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const configDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'configuration', CONFIG_ID);
  }, [firestore]);

  const { data: configData, isLoading } = useDoc<Configuration>(configDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleAddEmail = (values: z.infer<typeof formSchema>) => {
    if (!configDocRef) return;
    const currentEmails = configData?.validEmails || [];
    if (currentEmails.includes(values.email)) {
      toast({
        title: 'E-mail já existe',
        description: 'Este e-mail já está na lista de e-mails válidos.',
        variant: 'destructive',
      });
      return;
    }
    const updatedEmails = [...currentEmails, values.email];
    setDocumentNonBlocking(configDocRef, { validEmails: updatedEmails }, { merge: true });
    toast({ title: 'E-mail adicionado com sucesso!' });
    form.reset();
  };

  const handleDeleteEmail = (emailToDelete: string) => {
    if (!configDocRef) return;
    const updatedEmails = (configData?.validEmails || []).filter(email => email !== emailToDelete);
    setDocumentNonBlocking(configDocRef, { validEmails: updatedEmails }, { merge: true });
    toast({ title: 'E-mail removido com sucesso!', variant: 'destructive' });
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.push('/home-logada')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>Gerencie a lista de e-mails com permissão para acessar a aplicação.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddEmail)} className="flex items-end gap-2 mb-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Novo E-mail Válido</FormLabel>
                    <FormControl>
                      <Input placeholder="exemplo@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </form>
          </Form>

          <h3 className="text-lg font-medium mb-2">E-mails Válidos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : configData?.validEmails && configData.validEmails.length > 0 ? (
                configData.validEmails.map(email => (
                  <TableRow key={email}>
                    <TableCell className="font-medium">{email}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso irá remover permanentemente o e-mail "{email}" da lista de acesso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEmail(email)}>Deletar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    Nenhum e-mail válido configurado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

export default ConfiguracaoGeralPage;
