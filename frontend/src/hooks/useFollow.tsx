import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  IMessageAsResponse,
  ApplicationError,
} from '../../../backend/types/express.types';
import toast from 'react-hot-toast';
import type { ObjectId } from 'mongoose';
const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId: string | ObjectId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: 'POST',
        });

        const data = (await res.json()) as
          | IMessageAsResponse
          | ApplicationError;
        if (!res.ok) {
          if (data && 'error' in data) {
            throw new Error(data.error);
          } else throw new Error('Something went wrong');
        }
        if (data && 'error' in data) throw new Error(data.error);
        return data;
      } catch (error) {
        console.log('Error in useFollow,mutation', error);
        throw error;
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
        queryClient.invalidateQueries({ queryKey: ['authUser'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { follow, isPending };
};
export default useFollow;
