import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const signUp = async (
  req: Request,
  res: Response,
  next?: NextFunction,
  err?: ErrorRequestHandler
) => {
  res.json({ data: 'Signup route' });
};
export const login = async (req: Request, res: Response) => {
  res.json({ data: 'Signup route' });
};
export const logout = async (req: Request, res: Response) => {
  res.json({ data: 'Signup route' });
};
