import type { IUserAsResponse } from '../../../backend/types/auth.types';
import type { ApplicationResponse } from '../../../backend/types/express.types';

export const queryAuthUser = async () => {
  try {
    const res = await fetch('/api/auth/me');
    const data = (await res.json()) as ApplicationResponse<IUserAsResponse>;
    if (res.status === 401) return null; // dirty hack if we get unauthorized from the backend
    if (!res.ok) {
      if ('error' in data) {
        if (data.error) throw new Error(data.error as string);
      }
      throw new Error('Something went wrong');
    }
    if ('error' in data) throw new Error(data.error as string);
    console.log('authUser is here', data);
    return data;
  } catch (error) {
    console.log('Error in App,useQuery', error);
    throw error;
  }
};
