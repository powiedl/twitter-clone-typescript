import mongoose, { type ObjectId, Types } from 'mongoose';

export interface ICreateComment {
  text: string;
}

export interface IComment extends ICreateComment {
  _id?: ObjectId;
  user: ObjectId;
}

export interface ICreatePost {
  text?: string;
  img?: string;
}

export interface IPost extends ICreatePost {
  user: ObjectId;
  likes: ObjectId[];
  comments: IComment[];
}

export type IPostWithId = IPost & { _id: Types.ObjectId };

const postSchema = new mongoose.Schema<IPost>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  } as const,
  { timestamps: true }
);

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
