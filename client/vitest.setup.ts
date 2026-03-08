import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';

const memoryStore = (() => {
  const data = new Map<string, string>();
  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
    key(index: number) {
      return Array.from(data.keys())[index] ?? null;
    },
    get length() {
      return data.size;
    }
  };
})();

vi.stubGlobal('localStorage', memoryStore);

vi.mock('@react-oauth/google', () => {
  return {
    GoogleLogin: () => null,
    GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
    useGoogleLogin: () => () => Promise.resolve()
  };
});
