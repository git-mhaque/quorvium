import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { env } from '../env';
import { verifyGoogleAuth } from '../lib/api';
import type { Participant } from '../types';

interface AuthContextValue {
  user: Participant | null;
  isGoogleConfigured: boolean;
  signInAsGuest: (name: string) => void;
  signInWithGoogle: (params: { code: string }) => Promise<void>;
  signOut: () => void;
}

const STORAGE_KEY = 'quorvium:user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function generateGuestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Math.random().toString(36).slice(2, 10)}`;
}

function loadUser(): Participant | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as Participant;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Participant | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return loadUser();
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const setGuest = (name: string) => {
    const guest: Participant = {
      id: generateGuestId(),
      name,
      isGuest: true
    };
    setUser(guest);
  };

  const setGoogleUser = (profile: { id: string; name?: string | null; email?: string | null; avatarUrl?: string | null }) => {
    setUser({
      id: profile.id,
      name: profile.name ?? 'Google User',
      email: profile.email ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
      isGuest: false
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGoogleConfigured: Boolean(env.googleClientId),
      signInAsGuest: (name: string) => setGuest(name.trim() || 'Guest'),
      signInWithGoogle: async ({ code }) => {
        try {
          const { user: verified } = await verifyGoogleAuth({ code });
          setGoogleUser({
            id: verified.id,
            name: verified.name,
            email: verified.email,
            avatarUrl: verified.avatarUrl ?? undefined
          });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 501) {
            throw new Error(
              'Server is not configured for Google OAuth. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
            );
          }
          throw error;
        }
      },
      signOut: () => setUser(null)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
