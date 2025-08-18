import { type IUserWithId } from '../models/user.model';
export type ICreateUser = {
  username: string;
  fullName: string;
  password: string;
  email: string;
};
export type IUserAsResponse = Omit<IUserWithId, 'password'>;

export const isIUserWithId = (value: unknown): value is IUserWithId => {
  return (value as IUserWithId)._id !== undefined;
};
