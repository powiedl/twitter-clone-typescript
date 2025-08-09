import type { IUserAsResponse } from '../../../backend/types/auth.types';
import type { IMessageAsResponse } from '../../../backend/types/express.types';

export const querySuggestedUsers = async () => {
  try {
    const res = await fetch('/api/users/suggested');
    const data = (await res.json()) as IUserAsResponse[] | IMessageAsResponse;
    if (!res.ok) {
      if ('error' in data) {
        if (data.error) throw new Error(data.error as string);
      }
      throw new Error('Something went wrong');
    }
    if ('error' in data) throw new Error(data.error as string);
    return data;
  } catch (error) {
    console.log('Error in querySuggestedUsers,useQuery', error);
    throw error;
  }
};
