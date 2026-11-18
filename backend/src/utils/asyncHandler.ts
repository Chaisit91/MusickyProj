import { Request, Response, NextFunction } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

// ใช้แทน express-async-handler — ดัก async error ส่งต่อให้ errorMiddleware
export const asyncHandler = (fn: AsyncFn) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};
