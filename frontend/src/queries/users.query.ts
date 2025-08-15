import type { IUserAsResponse } from '../../../backend/types/auth.types';
import type {
  ApplicationError,
  IMessageAsResponse,
} from '../../../backend/types/express.types';

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

export const queryProfile = async (username?: string) => {
  if (!username) return;
  try {
    const res = await fetch(`/api/users/profile/${username}`);
    const data = (await res.json()) as
      | IUserAsResponse
      | IMessageAsResponse
      | ApplicationError;
    if (!res.ok) {
      if ('error' in data) {
        if (data.error) throw new Error(data.error);
      }
      if ('message' in data) {
        throw new Error(data.message);
      }
      throw new Error('Something went wrong');
    }
    if ('error' in data) throw new Error(data.error);
    return data;
  } catch (error) {
    console.log('Error in queryProfile,useQuery', error);
    throw error;
  }
};
