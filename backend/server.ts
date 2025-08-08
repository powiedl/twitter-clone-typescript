import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import postRoutes from './routes/post.route';
import notificationRoutes from './routes/notification.route';
import connectDb from './db/connectMongoDb';
import { IHealth } from './types/express.types';

dotenv.config();
if (!process.env.MONGO_URI) {
  console.log('Missing MONGO_URI environment variable - exiting ...');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log('Missing JWT_SECRET environment variable - exiting ...');
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_KEY) {
  console.log('Missing CLOUDINARY_API_KEY environment variable -exiting ...');
  process.exit(1);
}

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.log(
    'Missing CLOUDINARY_CLOUD_NAME environment variable -exiting ...'
  );
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_SECRET) {
  console.log(
    'Missing CLOUDINARY_API_SECRET environment variable -exiting ...'
  );
  process.exit(1);
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const PASSWORD_MIN_LENGTH = Number(process.env.PASSWORD_MIN_LENGTH) || 3;
const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true })); // to parse form data (urlencoded)
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('/api/health', (req, res: express.Response<IHealth>) => {
  res.status(200).json({ status: 'OK', route: '/api' });
});

app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`NODE_ENV:`, process.env?.NODE_ENV || 'production');
  connectDb();
});
