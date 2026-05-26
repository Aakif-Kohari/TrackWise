import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'trackwise-secret');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
