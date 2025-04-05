import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client/edge';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const studyPlans = await prisma.studyPlan.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(studyPlans);
    } catch (error) {
      console.error('Error fetching study plans:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, description, startDate, endDate } = req.body;

      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const studyPlan = await prisma.studyPlan.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'pending',
          userId: session.user.id,
        },
      });

      return res.status(201).json(studyPlan);
    } catch (error) {
      console.error('Error creating study plan:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 