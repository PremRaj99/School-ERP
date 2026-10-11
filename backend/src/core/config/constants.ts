export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// ------------------ JWT ------------------
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  '62b39b43ba78a6c026706883ec35a165cabd678d13d6dfddf5d5edbc6468e063';
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  '0abac188fd39fb9b900e68c60351c678732be612caccdf610fd470bf17649357';
// Was a hardcoded '15s' in both login and refresh — every request after 15 seconds 401'd and went
// through a refresh round-trip (two extra DB queries + a retry), flooding the backend.
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '30d';
