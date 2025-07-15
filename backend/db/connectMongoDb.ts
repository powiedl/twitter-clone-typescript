import mongoose, { Mongoose, MongooseError } from 'mongoose';

const connectDb = async (): Promise<typeof mongoose | undefined> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!, {});
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log('Error connecting to mongoDB:', error.message);
    } else {
      console.log('Unknown error:', error);
    }
  }
};

export default connectDb;
