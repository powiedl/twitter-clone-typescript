import {
  ApplicationResponse,
  IMessageAsResponse,
  TypedAuthorizedRequestBody,
  TypedRequestBody,
} from '../types/express.types';
import User from '../models/user.model';
import { hash, genSalt, compare } from 'bcrypt-ts';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken';
import { IUserAsResponse } from '../types/auth.types';
import { controllerError } from '../lib/utils/controllerError';
import { PASSWORD_MIN_LENGTH } from '../server';

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

    if (password.length < PASSWORD_MIN_LENGTH) {
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
    controllerError(error, 'in signUp in auth.controller.ts');
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
    controllerError(error, 'in login in auth.controller.ts');
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
    controllerError(error, 'in logout in auth.controller.ts');
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
    controllerError(error, 'in getMe in auth.controller.ts');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
