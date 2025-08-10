import { v2 as cloudinary } from 'cloudinary';
import { Types } from 'mongoose';

import { controllerError } from '../lib/utils/controllerError';
import Post, {
  ICreateComment,
  ICreatePost,
  IPost,
  IPostWithId,
} from '../models/post.model';
import User from '../models/user.model';
import {
  ApplicationResponse,
  IMessageAsResponse,
  TypedAuthorizedRequestBody,
} from '../types/express.types';
import Notification, { NotificationType } from '../models/notification.model';
import { IForeignUser } from '../types/user.types';

export interface IPopulatedPost {
  _id: Types.ObjectId;
  user: IForeignUser;
  likes: IForeignUser[];
  comments: (ICreateComment & { user: IForeignUser })[];
  text: string;
  img: string;
  // createdAt: Date;
  // updatedAt: Date;
  __v: number;
}

export const getAllPosts = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<IPopulatedPost[]>
) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', '-password') // simple form
      .populate({ path: 'comments.user', select: ['fullName', 'profileImg'] }) // extended form - where you pass an object with the specification of the population
      .populate({
        path: 'likes',
        // model: 'User', // you can define which model should be used to populate this path (but it is not needed in this case)
        select: ['fullName', 'profilePic', 'bio'],
      });

    if (posts.length === 0) return res.status(200).json([]);

    // @ts-expect-error TypeScript cannot check, that likedPosts is of type IPopulatedPosts[]
    res.status(200).json(posts);
  } catch (error) {
    controllerError('getAllPosts in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLikedPosts = async (
  req: TypedAuthorizedRequestBody<{}, { id: Types.ObjectId }>,
  res: ApplicationResponse<IPopulatedPost[] | IMessageAsResponse>
) => {
  try {
    const { id: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'likes',
        // model: 'User', // you can define which model should be used to populate this path (but it is not needed in this case)
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'comments.user',
        select: ['fullName', 'profilePic', 'bio'],
      });

    // @ts-expect-error TypeScript cannot check, that likedPosts is of type IPopulatedPosts[]
    return res.status(200).json(likedPosts);
  } catch (error) {
    controllerError('getLikedPosts in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserPosts = async (
  req: TypedAuthorizedRequestBody<{}, { username: string }>,
  res: ApplicationResponse<IPopulatedPost[] | IMessageAsResponse>
) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'likes',
        // model: 'User', // you can define which model should be used to populate this path (but it is not needed in this case)
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'comments.user',
        select: ['fullName', 'profilePic', 'bio'],
      });
    // @ts-expect-error
    return res.status(200).json(posts);
  } catch (error) {
    controllerError('getLikedPosts in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFollowingPosts = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<{}>
) => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const followingPosts = await Post.find({
      user: { $in: user.following },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'likes',
        // model: 'User', // you can define which model should be used to populate this path (but it is not needed in this case)
        select: ['fullName', 'profilePic', 'bio'],
      })
      .populate({
        path: 'comments.user',
        select: ['fullName', 'profilePic', 'bio'],
      });
    return res.status(200).json(followingPosts);
  } catch (error) {
    controllerError('getFollowingPosts in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const createPost = async (
  req: TypedAuthorizedRequestBody<ICreatePost>,
  res: ApplicationResponse<IPostWithId | IMessageAsResponse>
) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user!._id.toString();

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!text && !img)
      return res.status(400).json({ message: "Posts can't be empty" });
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    controllerError('createPost in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePost = async (
  req: TypedAuthorizedRequestBody<{}, { id: Types.ObjectId }>,
  res: ApplicationResponse<{} | IMessageAsResponse>
) => {
  try {
    console.log('hit the deletePost controller');
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user!._id.toString()) {
      return res.status(401).json({
        error:
          "You are not authorized to delete this post - because it is't yours.",
      });
    }
    console.log('  passed the preChecks successfully');
    if (post.img) {
      console.log(
        '  there is an image in the post, so we need to delete the image from cloudinary first'
      );
      const imgPath = post.img.split('/');
      const imgFile = imgPath.pop();
      const imgId = imgFile ? imgFile.split('.')[0] : undefined;
      if (imgId) {
        await cloudinary.uploader.destroy(imgId);
        console.log('    successfully deleted image from cloudinary');
      } else {
        console.log(
          `The img attribute doesn't contain a cloudinary resource id - therefore it can't be deleted in cloudinary. Please check this ${{
            _id: post._id,
            user: post.user,
            text: post.text,
            img: post.img,
          }}`
        );
      }
    }
    console.log('  delete the post in the database');
    await Post.findByIdAndDelete(req.params.id);
    console.log('    successfully deleted the post');
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    controllerError('deletePost in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const commentOnPost = async (
  req: TypedAuthorizedRequestBody<ICreateComment, { id: Types.ObjectId }>,
  res: ApplicationResponse<IPost | IMessageAsResponse>
) => {
  const { text } = req.body;
  const postId = req.params.id;
  const userId = req.user!._id;

  if (!text) {
    return res.status(400).json({ message: 'Text field is required' });
  }
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const comment = { user: new Types.ObjectId(userId), text };
  // @ts-expect-error
  post.comments.push(comment);
  await post.save();

  if (userId.toString() !== post.user.toString()) {
    const newNotification = new Notification({
      type: NotificationType.COMMENT,
      from: userId,
      to: post.user,
    });
    await newNotification.save();
  }

  res.status(200).json(post);
  try {
  } catch (error) {
    controllerError('commentOnPost in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const likeUnlikePost = async (
  req: TypedAuthorizedRequestBody<{}, { id: Types.ObjectId }>,
  res: ApplicationResponse<{ likes?: string[] } | IMessageAsResponse>
) => {
  try {
    const userId = req.user!._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (userId.toString() === post.user.toString())
      return res
        .status(400)
        .json({ message: "You can't like/unlike your own post" });
    // @ts-ignore
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // remove userId from the likes for this post
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes
        .filter((id) => id.toString() !== userId.toString())
        .map((l) => l.toString());
      return res
        .status(200)
        .json({ message: 'Post unliked successfully', likes: updatedLikes });
    } else {
      // like the post
      // @ts-ignore
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const newNotification = new Notification({
        type: NotificationType.LIKE,
        from: userId,
        to: post.user,
      });
      await newNotification.save();
      return res.status(200).json({
        message: 'Post liked successfully',
        likes: post.likes.map((l) => l.toString()),
      });
    }
  } catch (error) {
    controllerError('likeUnlikePost in post.controller.ts');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
