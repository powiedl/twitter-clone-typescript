import mongoose, { ObjectId, Types } from 'mongoose';

export interface IUser {
  username: string;
  fullName: string;
  password: string;
  email: string;
  followers: ObjectId[];
  following: ObjectId[];
  profileImg?: string;
  coverImg?: string;
  bio?: string;
  link?: string;
  likedPosts?: ObjectId[];
}

export type IUserWithId = IUser & { _id: Types.ObjectId };

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    followers: [{ type: Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: Types.ObjectId, ref: 'User', default: [] }],
    profileImg: {
      type: String,
      default: '',
    },
    coverImg: {
      type: String,
      default: '',
    },
    bio: { type: String, default: '' },
    link: { type: String, default: '' },
    likedPosts: [
      {
        type: Types.ObjectId,
        ref: 'Post',
        default: [],
      },
    ],
  } as const,
  { timestamps: true, versionKey: '__v' }
);
// increase __v at every save
userSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.__v += 1;
  }
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
