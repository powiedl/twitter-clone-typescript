import { Schema, Types } from 'mongoose';
import { NotificationType } from '../models/notification.model';

interface IFrom {
  _id?: string;
  fullName: string;
  username?: string;
  profileImg?: string;
  bio?: string;
}
export interface INotificationAsResponse {
  _id: string;
  from: IFrom;
  //type: NotificationType;
  type: string;
  read: boolean;
}
function isValidNotificationTypeValue(n: any): boolean {
  if (typeof n !== 'string') return false;
  let result = false;
  Object.values(NotificationType).forEach((el) => {
    if (result || n === el) result = true;
  });
  return result;
}

export const convertToINotificationAsResponse = (
  n: unknown
): INotificationAsResponse | undefined => {
  // early exits, because n does not have whats needed to be an INotificationAsResponse
  if (!n || typeof n !== 'object') {
    console.log(`  failed, because it is no object, but (${typeof n})`);
    return undefined;
  }
  if (!('from' in n) || !('_id' in n) || !('type' in n) || !('read' in n)) {
    console.log(
      `  failed, because it is missing 'from' or '_id' or 'type' or 'read' as attributes`
    );
    return undefined;
  }
  if (typeof n.type === 'string' && !isValidNotificationTypeValue(n.type)) {
    console.log(`  failed, because type is no valid NotificationType`);
    return undefined;
  }
  if (!n.from || typeof n.from !== 'object') {
    console.log(
      `    n.from is missing or is no object (it is ${typeof n?.from}`
    );
    return undefined;
  }
  if (!('fullName' in n.from)) {
    console.log('    fullName is missing in n.from');
    return undefined;
  }

  if (typeof n.from.fullName !== 'string') {
    // as fullName is the only mandatory attribute of n.from this checks if from fulfills the IFrom interface
    console.log(
      `     failed, because typeof n.from.fullName is:${typeof n.from.fullName}`
    );
    return undefined;
  }
  if (typeof n.read !== 'boolean') {
    console.log(
      `  failed, because 'read' is not of type 'boolean' (instead it is ${typeof n.read})`
    );
    return undefined;
  }

  let _id: string | undefined;
  let read: boolean;
  // _id
  if (typeof n._id === 'string') _id = n._id;
  if (n._id instanceof Types.ObjectId || n._id instanceof Schema.Types.ObjectId)
    _id = n._id.toString();
  if (!_id) {
    console.log(
      `  failed, because from._id could not be converted to a string (_id='${n._id}')`
    );
    return undefined; // we were not able to convert _id to a string
  }

  // from
  const f = n.from as IFrom;
  let from: IFrom = { fullName: f.fullName };
  if ('_id' in f) {
    if (typeof f._id === 'string') from._id = f._id;
    if (
      f._id &&
      ((f._id as any) instanceof Types.ObjectId ||
        (f._id as any) instanceof Schema.Types.ObjectId)
    )
      from._id = f._id.toString();
  } else {
    from._id = undefined;
  }
  if ('profileImg' in f && typeof 'profileImg' === 'string')
    from.profileImg = f.profileImg;
  else from.profileImg = undefined;
  if ('username' in f && typeof 'username' === 'string')
    from.username = f.username;
  else from.username = undefined;
  if ('bio' in f && typeof 'bio' === 'string') from.bio = f.bio;
  else from.bio = undefined;
  // all checks passed, so we know we can use n as a INotificationAsResponse
  return { _id, from, type: n.type as string, read: n.read };
};
