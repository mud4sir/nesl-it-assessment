import { ApiError } from "@/types/interfaces/interfaces.common";
import { Request, Response, NextFunction } from "express";

export const errorResponse = (error: ApiError, _req: Request, res: Response, _next: NextFunction) => {
   res.status(error.statusCode).json({
      success: false,
      data: error.data,
      message: error.message,
   });
};

export const GlobalExceptionHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
}