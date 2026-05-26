import prisma from '../db/client.js';
import asyncHandler from 'express-async-handler';

export const getHabits = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const habits = await prisma.habit.findMany({ where: { userId }, include: { logs: true } });
  res.json({ habits });
});

export const createHabit = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, targetDays } = req.body;
  const habit = await prisma.habit.create({
    data: { name, targetDays: Number(targetDays) || 7, userId }
  });
  res.json({ habit });
});

export const toggleHabit = asyncHandler(async (req, res) => {
  const habitId = Number(req.params.id);
  const userId = req.user.userId;
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== userId) {
    return res.status(404).json({ error: 'Not found or unauthorized' });
  }
  const { date = new Date().toISOString().slice(0, 10), completed } = req.body;
  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId, date } },
    update: { completed: Boolean(completed) },
    create: { habitId, date, completed: Boolean(completed) }
  });
  res.json({ log });
});

export const removeHabit = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.userId;
  const result = await prisma.habit.deleteMany({ where: { id, userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ removed: true });
});
