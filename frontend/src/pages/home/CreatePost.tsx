import { CiImageOn } from 'react-icons/ci';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { IoCloseSharp } from 'react-icons/io5';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [img, setImg] = useState<string | null>(null);

  const imgRef = useRef(null);

  const isPending = false;
  const isError = false;

  const data = {
    profileImg: '/avatars/boy1.png',
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Post created successfully');
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

  return (
    <div className='flex p-4 items-start gap-4 border-b border-gray-700'>
      <div className='avatar'>
        <div className='w-8 rounded-full'>
          <img src={data.profileImg || '/avatar-placeholder.png'} />
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
        {isError && <div className='text-red-500'>Something went wrong</div>}
      </form>
    </div>
  );
};
export default CreatePost;
