import { NextFunction, Request, Response } from "express";
import {
  ForbiddenError,
  NotFoundError,
  TooManyRequestError,
  UnauthorizedError,
  ValidationError,
  ApiError,
} from "./utils/ApiError";

import { validateSchema } from "./middlewares/validateSchema";
import { DatabaseError } from './utils/ApiError';

export const errorHandlerMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error : ", err.message);
  return res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    data: null,
    message: err.message || "Internal Server Error",
    success: false,
  });
};

export {
  ForbiddenError,
  NotFoundError,
  TooManyRequestError,
  UnauthorizedError,
  ValidationError,
  ApiError,
  DatabaseError,
  validateSchema
};
