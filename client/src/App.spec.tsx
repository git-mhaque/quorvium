import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import App from './App';
import { AuthProvider } from './state/auth';

describe('App', () => {
  it('renders the welcome headline', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome to Quorvium/i)).toBeInTheDocument();
  });

  it('disables board creation until a user signs in', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /create board/i })).toBeDisabled();
    expect(
      screen.getByText(/Sign in with Google to unlock board creation/i)
    ).toBeInTheDocument();
  });
});
