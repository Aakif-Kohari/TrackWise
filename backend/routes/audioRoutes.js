import express from 'express';
import { getTracks, getTrackById } from '../controllers/audioController.js';
const router = express.Router();
router.get('/tracks', getTracks);
router.get('/tracks/:id', getTrackById);
export default router;
