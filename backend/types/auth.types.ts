import { IUserWithId } from '../models/user.model';
export type ICreateUser = {
  username: string;
  fullName: string;
  password: string;
  email: string;
};
export type IUserAsResponse = Omit<IUserWithId, 'password'>;
