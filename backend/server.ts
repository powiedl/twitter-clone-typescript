import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import connectDb from './db/connectMongoDb';

dotenv.config();
if (!process.env.MONGO_URI) {
  console.log('Missing MONGO_URI environment variable - exiting ...');
  process.exit(1);
}

const PORT = process.env.PORT || 8000;
const app = express();

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
  connectDb();
});
