import { promises as fs } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BoardStore } from './boardStore.js';

describe('BoardStore', () => {
  let store: BoardStore;
  let dataDir: string;
  let dataFile: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(join(tmpdir(), 'quorvium-store-'));
    dataFile = join(dataDir, 'boards.json');
    store = new BoardStore(dataFile);
  });

  afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it('creates and retrieves a board', async () => {
    const board = await store.createBoard({
      name: 'Sprint Planning',
      owner: { id: 'user-1', name: 'Test User' }
    });
    const fetched = await store.getBoard(board.id);

    expect(fetched?.name).toBe('Sprint Planning');
    expect(fetched?.id).toBe(board.id);
  });

  it('persists sticky note changes', async () => {
    const board = await store.createBoard({
      name: 'Retrospective',
      owner: { id: 'user-2', name: 'Test User 2' }
    });
    const note = await store.createNote({
      boardId: board.id,
      note: { body: 'Keep doing async standups' }
    });

    await store.updateNote({
      boardId: board.id,
      noteId: note.id,
      patch: { x: 250, y: 120 }
    });

    const persisted = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    expect(persisted.boards[0].notes[note.id].x).toBe(250);

    await store.deleteNote(board.id, note.id);

    const cleaned = await store.getBoard(board.id);
    expect(cleaned?.notes[note.id]).toBeUndefined();
  });
});
