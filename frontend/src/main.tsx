import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/common/styles/index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Providers } from './shared/common/provider/provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
