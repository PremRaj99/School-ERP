import { createRoot } from 'react-dom/client';
import '@/shared/css/index.css';
import { Providers } from '@/shared/utils/provider';
import { AppRouter } from '@/routes';

createRoot(document.getElementById('root')!).render(
  <Providers>
    <AppRouter />
  </Providers>,
);
