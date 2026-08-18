import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../theme';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider defaultTheme="system">
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || 'google-auth-client'}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
