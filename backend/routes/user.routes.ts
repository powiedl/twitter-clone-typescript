import express from 'express';
import { protectRoute } from '../middleware/protectRoute.middleware';
import {
  followUnfollowUser,
  getUserProfile,
  getSuggestedUsers,
  updateUserProfile,
} from '../controllers/user.controller';
import { IHealth } from '../types/express.types';

const router = express.Router();

router.get('/health', (req, res: express.Response<IHealth>) => {
  res.status(200).json({ status: 'OK', route: '/api/user' });
});

router.get('/profile/:username', protectRoute, getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.post('/update', protectRoute, updateUserProfile);

export default router;
