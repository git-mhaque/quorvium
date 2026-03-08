import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

import { createBoard } from '../lib/api';
import { env } from '../env';
import { useAuth } from '../state/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { user, signInAsGuest, signInWithGoogle, signOut, isGoogleConfigured } = useAuth();
  const [boardName, setBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const isAuthenticatedCreator = Boolean(user && user.isGuest !== true);

  const handleCreateBoard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!boardName.trim()) {
      setError('Give your board a name first.');
      return;
    }
    if (!isAuthenticatedCreator || !user) {
      setError('Please sign in with Google before creating a board.');
      return;
    }

    try {
      setIsCreating(true);
      const { board } = await createBoard({
        name: boardName.trim(),
        owner: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl ?? undefined,
          email: user.email ?? undefined
        }
      });
      setBoardName('');
      navigate(`/boards/${board.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinBoard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = joinInput.trim();
    if (!trimmed) {
      setError('Paste a board URL or ID to join.');
      return;
    }
    try {
      const url = new URL(trimmed, window.location.origin);
      const parts = url.pathname.split('/');
      const id = parts[parts.length - 1];
      navigate(`/boards/${id}`);
    } catch {
      navigate(`/boards/${trimmed}`);
    }
  };

  const handleGuest = () => {
    const name = window.prompt('How should other collaborators see you?', 'Guest');
    if (name !== null) {
      signInAsGuest(name || 'Guest');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem'
      }}
    >
      <div style={{ maxWidth: 520, width: '100%' }}>
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p style={{ letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
            Gather your quorum of ideas
          </p>
          <h1 style={{ fontSize: '2.75rem', margin: '0.5rem 0 0' }}>Welcome to Quorvium</h1>
          <p style={{ color: 'rgba(226,232,240,0.75)' }}>
            Spin up a board, invite your team, and sketch ideas together in real time.
          </p>
        </header>

        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <form onSubmit={handleCreateBoard}>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <span style={{ display: 'block', marginBottom: '0.4rem' }}>Board name</span>
              <input
                className="input"
                placeholder="e.g. Launch Planning"
                value={boardName}
                onChange={(event) => {
                  setBoardName(event.target.value);
                  setError(null);
                }}
              />
            </label>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isCreating || !isAuthenticatedCreator}
              style={{ width: '100%' }}
            >
              {isCreating ? 'Creating…' : 'Create board'}
            </button>
          </form>
          {!isAuthenticatedCreator && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'rgba(226,232,240,0.75)' }}>
              Sign in with Google to unlock board creation. Guests can still join existing boards.
            </p>
          )}
          {error && (
            <p style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
          )}
        </section>

        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Join an existing board</h2>
          <form onSubmit={handleJoinBoard}>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <span style={{ display: 'block', marginBottom: '0.4rem' }}>Board URL or ID</span>
              <input
                className="input"
                placeholder="https://quorvium.app/boards/..."
                value={joinInput}
                onChange={(event) => {
                  setJoinInput(event.target.value);
                  setError(null);
                }}
              />
            </label>
            <button className="btn btn-secondary" type="submit" style={{ width: '100%' }}>
              Join board
            </button>
          </form>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>
            {user ? `Signed in as ${user.name}` : 'Sign in to create boards'}
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user ? (
              <button className="btn btn-secondary" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <>
                {isGoogleConfigured ? (
                  <GoogleSignInButton
                    onCode={async (code) => {
                      try {
                        await signInWithGoogle({ code });
                        setError(null);
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : 'Google sign-in failed. Try again.'
                        );
                      }
                    }}
                    onError={() => setError('Google sign-in failed. Try again.')}
                  />
                ) : (
                  <p style={{ color: 'rgba(226,232,240,0.75)' }}>
                    Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
                  </p>
                )}
                <button className="btn btn-secondary" type="button" onClick={handleGuest}>
                  Continue as guest
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface GoogleSignInButtonProps {
  onCode: (code: string) => Promise<void> | void;
  onError: () => void;
}

function GoogleSignInButton({ onCode, onError }: GoogleSignInButtonProps) {
  const login = useGoogleLogin({
    flow: 'auth-code',
    redirect_uri: env.googleRedirectUri,
    onSuccess: async (response) => {
      if (response.code) {
        await onCode(response.code).catch(() => undefined);
      } else {
        onError();
      }
    },
    onError: () => {
      onError();
    }
  });

  return (
    <button className="btn btn-secondary" type="button" onClick={() => login()}>
      Sign in with Google
    </button>
  );
}
