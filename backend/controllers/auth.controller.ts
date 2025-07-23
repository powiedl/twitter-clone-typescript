import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import {
  ApplicationError,
  ApplicationResponse,
  IMessageAsResponse,
  TypedAuthorizedRequestBody,
  TypedRequestBody,
} from '../types/express.types';
import User, { IUser, IUserWithId } from '../models/user.model';
import { hash, genSalt, compare } from 'bcrypt-ts';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken';
import { IUserAsResponse } from '../types/auth.types';

export const signUp = async (
  req: TypedRequestBody<{
    fullName: string;
    username: string;
    email: string;
    password: string;
  }>,
  res: ApplicationResponse<IUserAsResponse>
) => {
  try {
    const { fullName, username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    if (password.length < 3) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 3 characters long' });
    }

    // hash password
    const salt = await genSalt(10);
    const hashedPasword = await hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPasword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }

    //const
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('message' in error) {
        console.log('Error in signup in auth.controller.ts:', error.message);
      } else {
        console.log(
          'Error in signup in auth.controller.ts (without an attribute message)',
          error
        );
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const login = async (
  req: TypedRequestBody<{
    username: string;
    password: string;
  }>,
  res: ApplicationResponse<IUserAsResponse>
) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await compare(password, user?.password || '');
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('message' in error) {
        console.log('Error in login in auth.controller.ts:', error.message);
      } else {
        console.log(
          'Error in login in auth.controller.ts (without an attribute message)',
          error
        );
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const logout = async (
  req: TypedRequestBody<{}>,
  res: ApplicationResponse<IMessageAsResponse>
) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('message' in error) {
        console.log('Error in logout in auth.controller.ts:', error.message);
      } else {
        console.log(
          'Error in logout in auth.controller.ts (without an attribute message)',
          error
        );
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMe = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<IUserAsResponse>
) => {
  try {
    const user = req.user; //await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if ('message' in error) {
        console.log('Error in getMe in auth.controller.ts:', error.message);
      } else {
        console.log(
          'Error in getMe in auth.controller.ts (without an attribute message)',
          error
        );
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
