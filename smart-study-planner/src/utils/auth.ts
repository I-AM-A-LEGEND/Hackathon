import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

interface JWTPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const getTokenFromRequest = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }
  return jwt.verify(token, secret) as JWTPayload;
};

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}; 