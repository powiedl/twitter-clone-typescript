import { BsEmojiSmileFill } from 'react-icons/bs';
import { CiImageOn } from 'react-icons/ci';

const CreatePostSkeleton = () => {
  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full animate-pulse'>
          <img src='/avatar-placeholder.png' />
        </div>
      </div>
      <div className='flex flex-col gap-2 w-full'>
        <div className='textarea w-full p-0 text-lg resize-none border-gray-800 animate-pulse background-gray-700'>
          <div className='w-1/2 h-6 bg-gray-700 rounded-lg' />
        </div>

        <div className='flex justify-between border-t py-2 border-t-gray-700'>
          <div className='flex gap-1 items-center'>
            <CiImageOn className='fill-gray-700 w-6 h-6 cursor-pointer animate-pulse' />
            <BsEmojiSmileFill className='fill-gray-700 w-5 h-5 cursor-pointer animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePostSkeleton;
