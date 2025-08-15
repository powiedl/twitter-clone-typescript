import Post from './Post';
import PostSkeleton from '../skeletons/PostSkeleton';
import { shouldBeUnreachable } from '../../utils/shouldBeUnreachable';
import { queryPosts } from '../../queries/posts.query';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export enum EFeedType {
  FOR_YOU = 'FOR_YOU',
  FOLLOWING = 'FOLLOWING',
  POSTS = 'POSTS',
  LIKES = 'LIKES',
}

const getPostEndpoint = (
  feedType: EFeedType,
  username: string,
  userId: string
): string | undefined => {
  switch (feedType) {
    case EFeedType.FOR_YOU:
      return '/api/posts/all';
    case EFeedType.FOLLOWING:
      return '/api/posts/following';
    case EFeedType.POSTS:
      return `/api/posts/user/${username}`;
    case EFeedType.LIKES:
      return `/api/posts/likes/${userId}`;
    default:
      shouldBeUnreachable(feedType);
  }
};

const Posts = ({
  feedType,
  username,
  userId,
}: {
  feedType: EFeedType;
  username?: string;
  userId?: string;
}) => {
  const POST_ENDPOINT = getPostEndpoint(
    feedType,
    username || 'invalid-username',
    userId || 'invalid-objectid'
  );
  const noPosts = (
    <p className='text-center my-4'>No posts in this tab. Switch 👻</p>
  );
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => queryPosts(POST_ENDPOINT),
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  if (isLoading || isRefetching)
    return (
      <div className='flex flex-col justify-center'>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );

  if (typeof posts === 'undefined') return noPosts;
  if (!('length' in posts)) return noPosts;
  if (posts.length === 0) return noPosts;
  if (!('_id' in posts[0])) return noPosts;

  return (
    <>
      {posts.map((post) => (
        <Post key={post?._id} post={post} />
      ))}
    </>
  );
};
export default Posts;
