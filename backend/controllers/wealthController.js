import prisma from '../db/client.js';
import asyncHandler from 'express-async-handler';

export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const incomes = await prisma.income.findMany({ where: { userId } });
  const expenses = await prisma.expense.findMany({ where: { userId } });

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const categories = expenses.reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + Number(item.amount);
    return map;
  }, {});

  res.json({ incomes, expenses, totalIncome, totalExpense, categories });
});

export const addIncome = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { amount, source, category, description, date } = req.body;
  const income = await prisma.income.create({
    data: {
      amount: Number(amount),
      source,
      category,
      description,
      date: date || new Date().toISOString().slice(0, 10),
      userId
    }
  });
  res.json({ income });
});

export const addExpense = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { amount, category, description, date } = req.body;
  const expense = await prisma.expense.create({
    data: {
      amount: Number(amount),
      category,
      description,
      date: date || new Date().toISOString().slice(0, 10),
      userId
    }
  });
  res.json({ expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.userId;
  const result = await prisma.expense.deleteMany({ where: { id, userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ deleted: true });
});

export const deleteIncome = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.userId;
  const result = await prisma.income.deleteMany({ where: { id, userId } });
  if (result.count === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ deleted: true });
});
