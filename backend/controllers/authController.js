import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '../db/client.js';
import asyncHandler from 'express-async-handler';

dotenv.config({ path: '../.env' });

const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET || 'trackwise-secret',
    { expiresIn: '7d' }
  );
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password required' });
  }

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hash }
  });

  const token = signToken(user);
  res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
});
