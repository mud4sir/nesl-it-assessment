import { JWTPayload } from '@/types/types/types.common';
import { users } from '@/config/db';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authorize(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token format' });
      }

      const token = authHeader.substring(7);

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'JWT secret is not configured' });
      }

      const decoded = jwt.verify(token, secret) as JWTPayload;

      const validRole = users.find(user => user.role === decoded.role);
      if (!validRole) {
        return res.status(403).json({ error: 'Invalid role for user' + decoded });
      }

      req.user = decoded;
      next();

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
