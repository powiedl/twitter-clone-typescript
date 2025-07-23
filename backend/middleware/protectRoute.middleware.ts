import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/user.model';
import {
  ApplicationResponse,
  TypedAuthorizedRequestBody,
} from '../types/express.types';

export const protectRoute = async (
  req: TypedAuthorizedRequestBody<{}>,
  res: ApplicationResponse<{}>,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;
    if (!token)
      return res.status(401).json({ error: 'Unauthorized: No Token Provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded)
      return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
    //console.log('protectRoute,decoded:', decoded);
    if (!(typeof decoded === 'object') || !('userId' in decoded)) {
      return res
        .status(401)
        .json({ error: 'Unauthorized: Invalid Token  no userId' });
    }
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof Error) {
      if ('message' in error) {
        console.log('Error in protectRoute.middleware.ts:', error.message);
      } else {
        console.log(
          'Error in signup in auth.controller.ts (without an attribute message)',
          error
        );
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
