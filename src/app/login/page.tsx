'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useRemoteConfig, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { Landmark, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, UserCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import SecureLS from 'secure-ls';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }).default('fabio.alvaro@gmail.com'),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres.' }).default('senha123'),
});

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.74 15.89 17.03 17.14 15.95 17.91V20.53H19.89C21.67 18.91 22.56 16.29 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C15.14 23 17.81 21.95 19.89 20.53L15.95 17.91C14.87 18.66 13.56 19.11 12 19.11C9.13 19.11 6.69 17.25 5.82 14.77L1.83 14.77V17.39C3.78 20.93 7.56 23 12 23Z" fill="#34A853"/>
        <path d="M5.82 14.77C5.62 14.2 5.5 13.57 5.5 12.91C5.5 12.25 5.62 11.62 5.82 11.05V8.43L1.83 8.43C0.97 10.02 0.5 11.91 0.5 14C0.5 16.09 0.97 17.98 1.83 19.57L5.82 14.77Z" fill="#FBBC05"/>
        <path d="M12 5.39C13.62 5.39 15.01 5.94 16.03 6.91L19.98 3.09C17.81 1.19 15.14 0 12 0C7.56 0 3.78 2.07 1.83 5.61L5.82 8.43C6.69 5.95 9.13 4.09 12 4.09C12 4.09 12 5.39 12 5.39Z" fill="#EA4335"/>
    </svg>
  );

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'fabio.alvaro@gmail.com',
      password: 'senha123',
    },
  });
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { values: remoteConfigValues } = useRemoteConfig();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const appVersion = remoteConfigValues['geral_versao_app'];

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/home-logada');
    }
  }, [user, isUserLoading, router]);

  async function handleUserSession(userCredential: UserCredential) {
    if (!firestore) return;
    const user = userCredential.user;
    
    // Check if user profile exists, if not, create it
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        id: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        createdAt: Timestamp.now(),
        familyId: null,
      });
    }

    // @ts-ignore
    const accessToken = user.accessToken;
    const userEmail = user.email;

    if (typeof window !== 'undefined') {
      const ls = new SecureLS({ encodingType: 'aes' });
      ls.set('userToken', accessToken);
      ls.set('userEmail', userEmail);
    }
    
    router.push('/home-logada');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAuthError(null);
    if (!auth) {
        setAuthError('Serviço de autenticação não está disponível.');
        setIsLoading(false);
        return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        await handleUserSession(userCredential);
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
      if (error instanceof FirebaseError) {
         if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Email ou senha inválidos.';
         }
      }
      setAuthError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setAuthError(null);
    if (!auth) {
      setAuthError('Serviço de autenticação não está disponível.');
      setIsGoogleLoading(false);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleUserSession(userCredential);
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao tentar fazer login com o Google.';
      if (error instanceof FirebaseError) {
        if (error.code !== 'auth/popup-closed-by-user') {
          errorMessage = 'Falha na autenticação com Google. Tente novamente.';
        } else {
            errorMessage = null; // Don't show error if user closes popup
        }
      }
      if (errorMessage) {
        setAuthError(errorMessage);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  if (isUserLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="flex items-center gap-3 mb-8 cursor-pointer">
        <Landmark className="h-10 w-10 text-primary" />
        <h1 className="text-5xl font-headline font-bold">CasalCash</h1>
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Acesse com suas credenciais ou use o Google.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {authError && (
                <Alert variant="destructive">
                  <AlertTitle>Erro de Login</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>
                <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Google
                </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
      {appVersion && (
        <p className="mt-8 text-sm text-muted-foreground">
          Versão: {appVersion}
        </p>
      )}
    </main>
  );
}
