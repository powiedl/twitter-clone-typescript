import { IUserWithId } from '../models/user.model';

export type IForeignUser = Omit<
  IUserWithId,
  'username' | 'password' | 'email' | 'likedPosts'
>;
