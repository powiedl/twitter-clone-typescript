import { type IUserWithId } from '../models/user.model';

export type IForeignUser = Omit<
  IUserWithId,
  'password' | 'email' | 'likedPosts'
>;
