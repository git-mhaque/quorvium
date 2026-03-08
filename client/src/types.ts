export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string | null;
  isGuest?: boolean;
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

export interface CreateBoardPayload {
  name: string;
  owner: Participant;
}

export interface BoardState {
  board: Board | null;
  isLoading: boolean;
  error?: string;
}
