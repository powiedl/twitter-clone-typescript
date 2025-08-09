import { compare, genSalt, hash } from 'bcrypt-ts';
import { v2 as cloudinary } from 'cloudinary';

import {
  ApplicationResponse,
  IMessageAsResponse,
  TypedAuthorizedRequestBody,
} from '../types/express.types';
import User from '../models/user.model';
import { IUserAsResponse } from '../types/auth.types';
import { controllerError } from '../lib/utils/controllerError';
import { Types } from 'mongoose';
import Notification, { NotificationType } from '../models/notification.model';
import { PASSWORD_MIN_LENGTH } from '../server';

export const getUserProfile = async (
  req: TypedAuthorizedRequestBody<{}, { username: string }>,
  res: ApplicationResponse<IUserAsResponse | IMessageAsResponse>
) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    controllerError(error, 'getUserProfile in user.controller.ts');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getSuggestedUsers = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<IUserAsResponse[] | IMessageAsResponse>
) => {
  try {
    const userId = req.user!._id;
    const usersFollowedByMe = req.user!.following;
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // exclude myself from the list of the users
        },
      },
      { $sample: { size: 10 } }, // return max 10 users
    ]);
    console.log('#users (excluding me):', users.length);
    const filteredUsers: IUserAsResponse[] = users.filter(
      (user) => !usersFollowedByMe.includes(user._id)
    ); // exclude users I'm already following
    const suggestedUsers = filteredUsers.map((user) => ({
      ...user,
      password: null, // to override the password - it would be nicer if the password attribute is completely removed (not only the value set to null)
      isFollowing: false,
    })); // add isFollowing to the list of the filteredUsers
    suggestedUsers.slice(0, 4); // we can't reduce the sample size in the aggregate because after aggregation users I'm already following are filtered out
    console.log('#suggestedUsers:', suggestedUsers.length);
    res.status(200).json(suggestedUsers.slice(0, 4) as IUserAsResponse[]);
  } catch (error: unknown) {
    res.status(500).json({ error: 'Internal Server Error' });
    controllerError(error, 'getSuggestedUsers in user.controller.ts');
  }
};
export const followUnfollowUser = async (
  req: TypedAuthorizedRequestBody<{}, { id: Types.ObjectId }>,
  res: ApplicationResponse<IMessageAsResponse>
) => {
  try {
    const { id } = req.params;
    const userToModify = (await User.findById(id)) as Omit<
      IUserAsResponse,
      'followers'
    > & {
      followers: Types.ObjectId[];
    };
    if (!userToModify)
      return res
        .status(404)
        .json({ message: 'User to follow/unfollow not found' });
    const currentUser = req.user!;
    if (userToModify._id.toString() === currentUser._id.toString()) {
      // .toString() is needed because the _id is a "complex" type where the memory addresses are compared - which are not the same
      return res
        .status(400)
        .json({ message: 'You cannot follow/unfollow yourself' });
    }
    const isFollowing = userToModify.followers.includes(currentUser._id);
    if (isFollowing) {
      // unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user!._id } }); // $pull - removes the element from the array
      await User.findByIdAndUpdate(req.user!._id, { $pull: { following: id } });

      // TODO: return the id of the user as a response
      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      // follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user!._id } }); // $push - adds the element to the array
      await User.findByIdAndUpdate(req.user!._id, { $push: { following: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: NotificationType.FOLLOW,
        from: currentUser._id,
        to: userToModify._id,
      });
      await newNotification.save();

      // TODO: return the id of the user as a response
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    controllerError(error, 'followUnfollowUser in user.controller.ts');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const updateUserProfile = async (
  req: TypedAuthorizedRequestBody<
    IUserAsResponse & { currentPassword: string; newPassword: string }
  >,
  res: ApplicationResponse<IUserAsResponse | IMessageAsResponse>
) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user!._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // #region change password
    if ((!newPassword && currentPassword) || (newPassword && !currentPassword))
      return res.status(400).json({
        message: 'Please provide both current password and new password',
      });

    if (currentPassword && newPassword) {
      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: 'Current password is incorrect' });
      if (newPassword.length < PASSWORD_MIN_LENGTH)
        return res.status(400).json({
          error: `new Password is too short (must be at least ${PASSWORD_MIN_LENGTH} characters long)`,
        });
      const salt = await genSalt(10);
      user.password = await hash(newPassword, salt);
    }
    // #endregion

    // #region change images
    if (profileImg) {
      if (user.profileImg) {
        // https://res.cloudinary.com/{cloudinarycloudid}/image/upload/{folderid}/{resourceId}.png
        const cloudinaryResourceId = user.profileImg
          .split('/') // split at the /
          .pop() // get the element after the last /
          ?.split('.')[0]; // split at the . and get the first element - which is the resourceId
        cloudinaryResourceId &&
          (await cloudinary.uploader.destroy(cloudinaryResourceId));
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const cloudinaryResourceId = user.coverImg
          .split('/')
          .pop()
          ?.split('.')[0];
        cloudinaryResourceId &&
          (await cloudinary.uploader.destroy(cloudinaryResourceId));
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    // #endregion

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    const changedUser: IUserAsResponse & { password?: string | null } =
      await user.save();
    changedUser.password = null;

    return res.status(200).json(changedUser);
  } catch (error) {
    controllerError(error, 'updateUserProfile in user.controller.ts');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
