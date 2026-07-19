import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/shared/hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

interface ApiError {
  response?: { data?: { message?: string } };
}

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ContactFormValues = z.infer<typeof contactSchema>;

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'contact'>('login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { fetchUser } = useAuth();

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Contact Form
  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors },
    reset: resetContact,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      setErrorMsg(null);
      const user = await fetchUser();
      if (user) {
        window.location.href = `/${user.role.toLowerCase()}`;
      }
    },
    onError: (err: ApiError) => {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify credentials.');
    },
  });

  const contactMutation = useMutation({
    mutationFn: authService.contact,
    onSuccess: () => {
      setErrorMsg(null);
      setSuccessMsg('Your message was sent successfully! We will get back to you soon.');
      resetContact();
    },
    onError: (err: ApiError) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit contact request.');
    },
  });

  const onLogin = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onContact = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">School ERP</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Manage your academic journey with ease
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as 'login' | 'contact');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full"
            >
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="login">Portal Login</TabsTrigger>
                <TabsTrigger value="contact">Contact Support</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <Alert>
                      <AlertDescription className="font-medium text-green-600">
                        {successMsg}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      className="border-input"
                      {...registerLogin('username')}
                    />
                    {loginErrors.username && (
                      <p className="text-destructive text-xs font-medium">
                        {loginErrors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="border-input"
                      {...registerLogin('password')}
                    />
                    {loginErrors.password && (
                      <p className="text-destructive text-xs font-medium">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="mt-4 w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="contact">
                <form onSubmit={handleContactSubmit(onContact)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="border-input"
                      {...registerContact('name')}
                    />
                    {contactErrors.name && (
                      <p className="text-destructive text-xs font-medium">
                        {contactErrors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="border-input"
                      {...registerContact('email')}
                    />
                    {contactErrors.email && (
                      <p className="text-destructive text-xs font-medium">
                        {contactErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Describe your inquiry..."
                      className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      {...registerContact('message')}
                    />
                    {contactErrors.message && (
                      <p className="text-destructive text-xs font-medium">
                        {contactErrors.message.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4">
            <span className="text-muted-foreground text-xs">
              Contact School Administration for password issues.
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
