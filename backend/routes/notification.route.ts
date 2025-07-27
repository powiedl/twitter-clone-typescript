import express from 'express';
import { protectRoute } from '../middleware/protectRoute.middleware';
import { IHealth } from '../types/express.types';
import {
  deleteNotification,
  deleteNotifications,
  getNotifications,
} from '../controllers/notification.controller';

const router = express.Router();

router.get('/health', (req, res: express.Response<IHealth>) => {
  res.status(200).json({ status: 'OK', route: '/api/notifications' });
});

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNotifications);
router.delete('/:id', protectRoute, deleteNotification);
export default router;
