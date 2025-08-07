import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  CreatedResponse,
  AcceptedResponse,
  OkResponse,
  ApiResponse,
} from "./utils/ApiResponse";

export const asyncHandler =
  (requestHandler: RequestHandler) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await requestHandler(req, res, next);
      } catch (error) {
        next(error);
      }
    };

export { CreatedResponse, AcceptedResponse, OkResponse, ApiResponse };
