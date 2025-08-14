import type { ApplicationError } from '../../../backend/types/express.types';
import type { INotificationAsResponse } from '../../../backend/types/notification.types';

export const queryNotifications = async () => {
  try {
    const res = await fetch('/api/notifications');
    const data = (await res.json()) as
      | INotificationAsResponse[]
      | ApplicationError;
    if (!res.ok) {
      if ('error' in data) {
        if (data.error) throw new Error(data.error as string);
      }
      throw new Error('Something went wrong');
    }
    if ('error' in data) throw new Error(data.error as string);
    return data;
  } catch (error) {
    console.log('Error in queryNotifications,useQuery', error);
    throw error;
  }
};
