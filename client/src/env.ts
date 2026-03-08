export const env = {
  apiBaseUrl: __API_BASE_URL__,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  googleRedirectUri:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
};
