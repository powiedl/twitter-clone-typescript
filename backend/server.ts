import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import connectDb from './db/connectMongoDb';

dotenv.config();
if (!process.env.MONGO_URI) {
  console.log('Missing MONGO_URI environment variable - exiting ...');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.log('Missing JWT_SECRET environment variable - exiting ...');
  process.exit(1);
}

const PORT = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data (urlencoded)
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', route: '/api' });
});

app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`NODE_ENV:`, process.env?.NODE_ENV || 'production');
  connectDb();
});
