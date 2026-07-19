import { useState } from 'react';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
  // ⚡ useState ensures the same client instance on re-renders
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_APP_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>{children}</TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
