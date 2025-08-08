import type { ApplicationResponse } from '../../../backend/types/express.types';
import type { IPopulatedPost } from '../../../backend/controllers/post.controller';

export const queryPosts = async (endpoint: string | undefined) => {
  if (typeof endpoint === 'undefined') return [];
  try {
    const res = await fetch(endpoint);
    const data = (await res.json()) as ApplicationResponse<IPopulatedPost[]>;
    if (!res.ok) {
      if ('error' in data) {
        if (data.error) throw new Error(data.error as string);
      }
      throw new Error('Something went wrong');
    }
    if ('error' in data) throw new Error(data.error as string);
    return data;
  } catch (error) {
    console.log('Error in queryPosts,useQuery', error);
    throw error;
  }
};
