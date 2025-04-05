import { NextApiRequest, NextApiResponse } from 'next';
import { getTokenFromRequest, verifyToken } from '../utils/auth';
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