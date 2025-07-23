import type { Response } from 'express';
import type { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (
  userId: Types.ObjectId,
  res: Response<any, Record<string, any>>
) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15d',
  });

  res.cookie('jwt', token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: 'strict', // CSRF attacks cross-site request forgery attacks
    secure: process.env?.NODE_ENV !== 'development', // secure in every environment except development
  });
};
