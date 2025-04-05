import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenFromRequest, verifyToken } from '../utils/auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import User from '../database/models/User';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
  };
}

type ApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>;

export const withAuth = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // First try to get session from NextAuth
      const session = await getServerSession(req, res, authOptions);
      
      if (session && session.user) {
        // If we have a valid session, use it
        const userId = session.user.id;
        if (!userId) {
          return res.status(401).json({ error: 'Invalid session' });
        }
        
        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        (req as AuthenticatedRequest).user = {
          id: user.id.toString(),
          email: user.email
        };
        
        return handler(req as AuthenticatedRequest, res);
      }
      
      // Fallback to token-based auth (for API calls that don't use NextAuth)
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = verifyToken(token);
      if (!decoded || typeof decoded === 'string') {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      (req as AuthenticatedRequest).user = {
        id: user.id.toString(),
        email: user.email
      };

      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}; 