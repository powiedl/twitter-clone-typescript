import { type Response } from 'express';
import { type IUserAsResponse } from './auth.types';

export interface TypedRequestBody<T> extends Express.Request {
  cookies?: { jwt?: string };
  body: T;
}

export interface TypedAuthorizedRequestBody<T, P = {}> extends Express.Request {
  cookies?: { jwt?: string };
  user?: IUserAsResponse;
  body: T;
  params: P;
}

// this doesn't seem to work, because the methods (e. g. status) are missing ...
export interface TypedResponseBody<T> extends Express.Response {
  body: T;
}

export interface ApplicationResponse<T>
  extends Response<T | ApplicationError> {}

// #region special response body types
export interface ApplicationError {
  error: string;
}

export interface IMessageAsResponse {
  message: string;
}

export interface IHealth {
  status: string;
  route: string;
}
// #endregion
