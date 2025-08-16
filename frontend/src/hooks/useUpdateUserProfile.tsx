import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IUserAsResponse } from '../../../backend/types/auth.types';
import type {
  ApplicationError,
  IMessageAsResponse,
} from '../../../backend/types/express.types';
import toast from 'react-hot-toast';

type IProfileFormData = {
  fullName?: string;
  username?: string;
  email?: string;
  bio?: string;
  link?: string;
  newPassword?: string;
  currentPassword?: string;
  coverImg?: string | null;
  profileImg?: string | null;
};
const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData: IProfileFormData) => {
        try {
          const res = await fetch('/api/users/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          const data = (await res.json()) as
            | IUserAsResponse
            | IMessageAsResponse
            | ApplicationError;
          if (!res.ok) {
            if ('error' in data) {
              if (data.error) throw new Error(data.error);
            }
            throw new Error('Something went wrong');
          }
          return data;
        } catch (error) {
          console.log('Error in Post,deleteNotificationsMutation', error);
          throw error;
        }
      },
      onSuccess: () => {
        toast.success('Profile updated successfully');
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['authUser'] }),
          queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
        ]);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  return { updateProfile, isUpdatingProfile };
};
export default useUpdateUserProfile;
