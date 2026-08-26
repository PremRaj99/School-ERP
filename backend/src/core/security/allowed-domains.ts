const configuredDomains = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'https://erp.premraj.online',
  'https://school-erp-frontend-phi-lemon.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
].filter(Boolean) as string[];

export const allowedDomains = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return callback(null, true);

  const isConfigured = configuredDomains.some((domain) => origin === domain);
  const isVercelPreview = origin.endsWith('.vercel.app');

  if (isConfigured || isVercelPreview || process.env.NODE_ENV === 'development') {
    return callback(null, true);
  }

  return callback(new Error(`Origin ${origin} not allowed by CORS`));
};
