import 'dotenv/config';

function getNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  port: getNumber(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ??
    process.env.CLIENT_ORIGIN ??
    'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production'
};
