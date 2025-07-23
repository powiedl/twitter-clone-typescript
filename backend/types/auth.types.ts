import { IUserWithId } from '../models/user.model';

export type IUserAsResponse = Omit<IUserWithId, 'password'>;
