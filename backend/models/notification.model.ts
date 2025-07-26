import mongoose, { ObjectId, Types } from 'mongoose';

export interface INotification {
  from: ObjectId;
  to: ObjectId;
  type: string;
  read?: boolean;
}

export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
}

export type INotificationWithId = INotification & { _id: Types.ObjectId };

const notificationSchema = new mongoose.Schema<INotification>(
  {
    from: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: NotificationType,
    },
    read: {
      type: Boolean,
      default: false,
    },
  } as const,
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

export default Notification;
