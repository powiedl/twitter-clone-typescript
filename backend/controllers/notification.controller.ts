import { Types } from 'mongoose';
import { controllerError } from '../lib/utils/controllerError';
import Notification from '../models/notification.model';
import {
  ApplicationResponse,
  IMessageAsResponse,
  TypedAuthorizedRequestBody,
} from '../types/express.types';
import {
  convertToINotificationAsResponse,
  INotificationAsResponse,
} from '../types/notification.types';

export const getNotifications = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<INotificationAsResponse[]>
) => {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: 'from',
      select: ['fullName', 'username', 'bio', 'profileImg'],
    });
    await Notification.updateMany({ to: userId }, { read: true });
    const notificationsAsResponse = notifications
      .map((n) => convertToINotificationAsResponse(n))
      .filter((n) => typeof n !== 'undefined'); // filter only the notifications which can be treated as INotificationAsResponse
    res.status(200).json(notificationsAsResponse);
  } catch (error) {
    controllerError('getNotifications in notification.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const deleteNotifications = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<IMessageAsResponse>
) => {
  try {
    const userId = req.user!._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    controllerError('deleteNotifications in notification.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteNotification = async (
  req: TypedAuthorizedRequestBody<{}, { id: Types.ObjectId }>,
  res: ApplicationResponse<IMessageAsResponse>
) => {
  try {
    const userId = req.user!._id;
    const notificationId = req.params.id;
    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ message: 'Notification not found' });
    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: 'You are not allowed to delete this notification' });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    controllerError('deleteNotification in notification.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
