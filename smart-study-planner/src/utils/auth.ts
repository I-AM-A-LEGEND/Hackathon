import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

// Define the JWT payload structure
export interface JWTPayload {
  id: number;
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract token from request headers or cookies
 */
export const getTokenFromRequest = (req: NextApiRequest): string | null => {
  // First try to get from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Then try to get from cookies
  const { cookies } = req;
  if (cookies && cookies['next-auth.session-token']) {
    return cookies['next-auth.session-token'];
  }
  
  // Finally try to get from secure cookies (used in production)
  if (cookies && cookies['__Secure-next-auth.session-token']) {
    return cookies['__Secure-next-auth.session-token'];
  }
  
  return null;
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables');
  }
  
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables');
  }
  
  try {
    return jwt.sign(payload, secret, { 
      expiresIn: '7d',
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('JWT signing error:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Decode token without verification (use for debugging only)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}; 