import { CiImageOn } from 'react-icons/ci';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryAuthUser } from '../../queries/authUser.query';
import type {
  ApplicationResponse,
  IMessageAsResponse,
} from '../../../../backend/types/express.types';
import type { IPostWithId } from '../../../../backend/models/post.model';
import toast from 'react-hot-toast';
import CreatePostSkeleton from '../../components/skeletons/CreatePostSkeleton';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [img, setImg] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: queryAuthUser,
  });

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }: { text: string; img: string }) => {
      try {
        const res = await fetch('/api/posts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, img }),
        });
        const data = (await res.json()) as ApplicationResponse<
          IPostWithId | IMessageAsResponse
        >;
        if (!res.ok) {
          if ('error' in data) {
            if (data.error) throw new Error(data.error as string);
          }
          throw new Error('Something went wrong');
        }
        return data;
      } catch (error) {
        console.log('Error in CreatePost,CreatePostMutation', error);
        throw error;
      }
    },
    onSuccess: () => {
      setText('');
      setImg('');
      toast.success('Post created successfully');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const imgRef = useRef(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createPost({ text, img: img || '' });
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  if (isLoading) return <CreatePostSkeleton />;
  if (!authUser) return;

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img
            src={
              ('profileImg' in authUser &&
                typeof authUser.profileImg === 'string' &&
                authUser.profileImg) ||
              '/avatar-placeholder.png'
            }
          />
        </div>
      </div>
      <form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
        <textarea
          className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
          placeholder='What is happening?!'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className='relative w-72 mx-auto'>
            <IoCloseSharp
              className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
              onClick={() => {
                setImg(null);
                if (imgRef.current)
                  (imgRef.current as HTMLInputElement).value = '';
              }}
            />
            <img
              src={img}
              className='w-full mx-auto h-72 object-contain rounded'
            />
          </div>
        )}

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn
              className='fill-primary w-6 h-6 cursor-pointer'
              onClick={() => (imgRef.current! as HTMLInputElement).click()}
            />
            <BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
          </div>
          <input type='file' hidden ref={imgRef} onChange={handleImgChange} />
          <button className='btn btn-primary rounded-full btn-sm text-white px-4'>
            {isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
        {isError && <div className='text-red-500'>{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;
