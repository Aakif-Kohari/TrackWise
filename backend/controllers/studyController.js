import prisma from '../db/client.js';
import asyncHandler from 'express-async-handler';

export const getStudyItems = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const sessions = await prisma.studySession.findMany({ where: { userId } });
  const totalHours = sessions.reduce((sum, entry) => sum + Number(entry.hours), 0);
  res.json({ sessions, totalHours });
});

export const addStudyTopic = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { topic, goalHours } = req.body;
  const session = await prisma.studySession.create({
    data: {
      topic,
      goalHours: Number(goalHours) || 2,
      hours: 0,
      completed: false,
      date: new Date().toISOString().slice(0, 10),
      userId
    }
  });
  res.json({ session });
});

export const updateStudyHours = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.userId;
  const { hours, completed } = req.body;
  const result = await prisma.studySession.updateMany({
    where: { id, userId },
    data: {
      hours: hours !== undefined ? Number(hours) : undefined,
      completed: completed !== undefined ? completed : undefined
    }
  });
  if (result.count === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  const session = await prisma.studySession.findUnique({ where: { id } });
  res.json({ session });
});

export const removeStudyTopic = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.userId;
  const result = await prisma.studySession.deleteMany({ where: { id, userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ removed: true });
});
