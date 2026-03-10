import { env } from '../env';

export function buildBoardUrl(boardId: string): string {
  if (typeof window === 'undefined') {
    return `/boards/${boardId}`;
  }

  if (env.routerMode === 'hash') {
    const url = new URL(window.location.href);
    url.search = '';
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/index.html';
    }
    url.hash = `/boards/${boardId}`;
    return url.toString();
  }

  return `${window.location.origin}/boards/${boardId}`;
}
