import express from 'express';
import { getMe, login, logout, signUp } from '../controllers/auth.controller';
import { logCall } from '../middleware/logCall.middleware';
import { protectRoute } from '../middleware/protectRoute.middleware';
import { IHealth } from '../types/express.types';

const router = express.Router();

router.get('/health', (req, res: express.Response<IHealth>) => {
  res.status(200).json({ status: 'OK', route: '/api/auth' });
});
router.get('/me', protectRoute, getMe);
router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', logout);

export default router;
