import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client/edge';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const studyPlan = await prisma.studyPlan.findUnique({
        where: {
          id: id as string,
          userId: session.user.id,
        },
      });

      if (!studyPlan) {
        return res.status(404).json({ message: 'Study plan not found' });
      }

      return res.status(200).json(studyPlan);
    } catch (error) {
      console.error('Error fetching study plan:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 