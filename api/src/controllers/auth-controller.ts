import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/types/types.common';
import { users } from '@/config/db';

export const login = (req: Request, res: Response) => {
  const { id } = req.body;
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload: JWTPayload = {
    id: user.id,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

  res.status(200).json({ 
    token,
    user: {
      id: user.id,
      role: user.role
    }
  });
}