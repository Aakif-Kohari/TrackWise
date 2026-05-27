import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import wealthRoutes from './routes/wealthRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import habitRoutes from './routes/habitRoutes.js';

dotenv.config({ path: '../.env' });
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.use('/auth', authRoutes);
app.use('/audio', audioRoutes);
app.use('/wealth', wealthRoutes);
app.use('/study', studyRoutes);
app.use('/habits', habitRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Trackwise backend running on http://localhost:${port}`);
});
