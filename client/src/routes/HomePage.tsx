import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

import { createBoard } from '../lib/api';
import { env } from '../env';
import { useAuth } from '../state/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut, isGoogleConfigured } = useAuth();
  const [boardName, setBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState('');
  const isAuthenticatedCreator = Boolean(user && user.isGuest !== true);
  const [avatarErrored, setAvatarErrored] = useState(false);

  useEffect(() => {
    setAvatarErrored(false);
  }, [user?.avatarUrl]);

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
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {user.avatarUrl && !avatarErrored ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name ?? 'Signed in user'}
                    onError={() => setAvatarErrored(true)}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(148,163,184,0.25)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 600
                    }}
                  >
                    {(user.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(226,232,240,0.75)' }}>
                    Signed in as
                  </p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
                  {user.email && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(226,232,240,0.75)' }}>
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <button className="btn btn-secondary" type="button" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>Sign in with Google</h2>
                <p style={{ margin: 0, color: 'rgba(226,232,240,0.75)' }}>
                  Use your Google account to create new boards and collaborate with your team. If a
                  teammate shares a link, you can still join without signing in.
                </p>
              </div>
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
                <p style={{ color: 'rgba(226,232,240,0.75)', margin: 0 }}>
                  Add <code>VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
                </p>
              )}
            </div>
          )}
        </section>

        {isAuthenticatedCreator && (
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
              <button className="btn btn-primary" type="submit" disabled={isCreating} style={{ width: '100%' }}>
                {isCreating ? 'Creating…' : 'Create board'}
              </button>
            </form>
            {error && (
              <p style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
            )}
          </section>
        )}

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
    <button className="btn btn-primary" type="button" onClick={() => login()}>
      Sign in with Google
    </button>
  );
}
