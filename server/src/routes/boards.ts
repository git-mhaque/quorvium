import { Router } from 'express';
import { z } from 'zod';

import { boardStore } from '../store/boardStore.js';

const ownerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional()
});

const createBoardSchema = z.object({
  name: z.string().min(1).max(80),
  owner: ownerSchema
});

export const boardsRouter = Router();

boardsRouter.post('/', async (req, res, next) => {
  try {
    const payload = createBoardSchema.parse(req.body);
    const board = await boardStore.createBoard({
      name: payload.name,
      owner: payload.owner
    });
    res.status(201).json({
      board,
      shareUrl: `/boards/${board.id}`
    });
  } catch (error) {
    next(error);
  }
});

boardsRouter.get('/:boardId', async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const board = await boardStore.getBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json({ board });
  } catch (error) {
    next(error);
  }
});
