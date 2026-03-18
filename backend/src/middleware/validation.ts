import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.message
        });
      }
      return res.status(400).json({
        message: 'Validation failed',
        errors: 'Unknown validation error'
      });
    }
  };
};
