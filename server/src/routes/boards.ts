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

const listBoardsQuerySchema = z.object({
  ownerId: z.string().min(1)
});

const boardIdParamsSchema = z.object({
  boardId: z.string().min(1)
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

boardsRouter.get('/', async (req, res, next) => {
  try {
    const query = listBoardsQuerySchema.parse(req.query);
    const boards = await boardStore.listBoardsByOwner(query.ownerId);
    res.json({ boards });
  } catch (error) {
    next(error);
  }
});

boardsRouter.get('/:boardId', async (req, res, next) => {
  try {
    const { boardId } = boardIdParamsSchema.parse(req.params);
    const board = await boardStore.getBoard(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json({ board });
  } catch (error) {
    next(error);
  }
});

boardsRouter.delete('/:boardId', async (req, res, next) => {
  try {
    const { boardId } = boardIdParamsSchema.parse(req.params);
    const deleted = await boardStore.deleteBoard(boardId);
    if (!deleted) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
