import { useState } from 'react';

import Posts from '../../components/common/Posts';
import CreatePost from './CreatePost';
import { EFeedType } from '../../components/common/Posts.enum';

const HomePage = () => {
  const [feedType, setFeedType] = useState<EFeedType>(EFeedType.FOR_YOU);

  return (
    <>
      <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
        {/* Header */}
        <div className='flex w-full border-b border-gray-700'>
          <div
            className={
              'flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
            }
            onClick={() => setFeedType(EFeedType.FOR_YOU)}
          >
            For you
            {feedType === EFeedType.FOR_YOU && (
              <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
            )}
          </div>
          <div
            className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative'
            onClick={() => setFeedType(EFeedType.FOLLOWING)}
          >
            Following
            {feedType === EFeedType.FOLLOWING && (
              <div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
        <CreatePost />

        {/* POSTS */}
        <Posts feedType={feedType} />
      </div>
    </>
  );
};
export default HomePage;
