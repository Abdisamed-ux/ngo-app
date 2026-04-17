import { Response } from 'express';

export const success = (res: Response, data: unknown, statusCode = 200, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message: message || 'OK',
    data,
  });
};

export const error = (res: Response, statusCode: number, errorName: string, message: string) => {
  return res.status(statusCode).json({
    success: false,
    error: errorName,
    message,
  });
};
