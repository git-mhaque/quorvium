export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface StickyNote {
  id: string;
  body: string;
  color: string;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
  author?: Participant;
}

export interface Board {
  id: string;
  name: string;
  owner: Participant;
  createdAt: string;
  updatedAt: string;
  notes: Record<string, StickyNote>;
}

export interface CreateBoardInput {
  name: string;
  owner: Participant;
}

export interface CreateStickyNoteInput {
  boardId: string;
  note: {
    body: string;
    color?: string;
    x?: number;
    y?: number;
    author?: Participant;
  };
}

export interface UpdateStickyNoteInput {
  boardId: string;
  noteId: string;
  patch: Partial<Pick<StickyNote, 'body' | 'color' | 'x' | 'y'>>;
}
