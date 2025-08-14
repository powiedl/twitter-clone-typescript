import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { IoSettingsOutline } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import { FaHeart, FaNoteSticky } from 'react-icons/fa6';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryNotifications } from '../../queries/notifications.query';
import type {
  ApplicationError,
  IMessageAsResponse,
} from '../../../../backend/types/express.types';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: queryNotifications,
  });
  const { mutate: deleteNotifications, isPending } = useMutation<
    IMessageAsResponse | ApplicationError,
    void
  >({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/notifications', { method: 'DELETE' });
        const data = (await res.json()) as
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
      toast.success('Notifications deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: unknown) => {
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
      )
        toast.error(error.message);
      else
        toast.error(
          'Something went wrong (and there are no further details to show you what went wrong)'
        );
    },
  });
  /*
  const isLoading = false;
  const notifications = [
    {
      _id: '1',
      from: {
        _id: '1',
        username: 'johndoe',
        profileImg: '/avatars/boy2.png',
      },
      type: 'follow',
    },
    {
      _id: '2',
      from: {
        _id: '2',
        username: 'janedoe',
        profileImg: '/avatars/girl1.png',
      },
      type: 'like',
    },
  ];
*/

  const handleDeleteNotifications = () => {
    deleteNotifications();
  };

  return (
    <>
      <div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
        <div className='flex justify-between items-center p-4 border-b border-gray-700'>
          <p className='font-bold'>Notifications</p>
          <div className='dropdown '>
            <div tabIndex={0} role='button' className='m-1'>
              <IoSettingsOutline className='w-4' />
            </div>
            <ul
              tabIndex={0}
              className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
            >
              <li>
                <button
                  onClick={handleDeleteNotifications}
                  disabled={isPending}
                >
                  {isPending
                    ? 'Deleting notifications...'
                    : 'Delete all notifications'}
                </button>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className='flex justify-center h-full items-center'>
            <LoadingSpinner size='lg' />
          </div>
        )}
        {!isLoading && isError && (
          <div className='text-center font-bold text-red-500'>
            {error.message}
          </div>
        )}
        {!isLoading && !isError && notifications?.length === 0 && (
          <div className='text-center p-4 font-bold'>No notifications 🤔</div>
        )}
        {!isLoading &&
          !isError &&
          notifications?.map((notification) => (
            <div className='border-b border-gray-700' key={notification._id}>
              <div className='flex gap-2 p-4'>
                {notification.type === 'follow' && (
                  <FaUser className='w-7 h-7 text-primary' />
                )}
                {notification.type === 'like' && (
                  <FaHeart className='w-7 h-7 text-red-500' />
                )}
                {notification.type === 'comment' && (
                  <FaNoteSticky className='w-7 h-7 text-primary' />
                )}
                <Link to={`/profile/${notification.from.username}`}>
                  <div className='avatar'>
                    <div className='w-8 rounded-full'>
                      <img
                        src={
                          notification.from.profileImg ||
                          '/avatar-placeholder.png'
                        }
                      />
                    </div>
                  </div>
                  <div className='flex gap-1'>
                    <span className='font-bold'>
                      @{notification.from.username}
                    </span>{' '}
                    {notification.type === 'follow'
                      ? 'followed you'
                      : notification.type === 'comment'
                      ? 'commented your post'
                      : 'liked your post'}
                  </div>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
export default NotificationPage;
