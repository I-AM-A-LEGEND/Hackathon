import { NextApiResponse } from 'next';
import StudySession from '../../../database/models/StudySession';
import StudyPlan from '../../../database/models/StudyPlan';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { safeModelCreate, ensureField, processModelsForAPI } from '../../../database/models/modelHelper';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { studyPlanId } = req.query;
  
  if (!studyPlanId) {
    return res.status(400).json({ error: 'Study plan ID is required' });
  }

  // Convert studyPlanId to number
  const planId = typeof studyPlanId === 'string' ? parseInt(studyPlanId, 10) : Array.isArray(studyPlanId) ? parseInt(studyPlanId[0], 10) : NaN;
  
  if (isNaN(planId)) {
    return res.status(400).json({ error: 'Invalid study plan ID format' });
  }

  // Convert user ID to number
  const userId = parseInt(req.user.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  if (req.method === 'GET') {
    try {
      // First check if the study plan belongs to the user
      const studyPlan = await StudyPlan.findOne({
        where: { 
          id: planId,
          userId: userId 
        }
      });

      if (!studyPlan) {
        return res.status(404).json({ error: 'Study plan not found or access denied' });
      }

      const sessions = await StudySession.findAll({
        where: { 
          studyPlanId: planId,
          userId: userId
        },
        order: [['startTime', 'ASC']],
      });
      
      return res.status(200).json({
        success: true,
        studySessions: processModelsForAPI(sessions)
      });
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch study sessions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, startTime, endTime, notes, duration } = req.body;

      if (!title || !startTime) {
        return res.status(400).json({ error: 'Title and start time are required' });
      }

      // Validate study plan exists and belongs to user
      const studyPlan = await StudyPlan.findOne({
        where: { 
          id: planId, 
          userId: userId
        },
      });

      if (!studyPlan) {
        return res.status(404).json({ error: 'Study plan not found or access denied' });
      }

      const newSession = await StudySession.create(safeModelCreate({
        studyPlanId: planId,
        userId: userId,
        title: ensureField(title, ''),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: ensureField(duration, null),
        notes: ensureField(notes, null)
      }));

      return res.status(201).json({
        success: true,
        studySession: newSession ? newSession.toJSON() : null
      });
    } catch (error) {
      console.error('Error creating study session:', error);
      return res.status(500).json({ 
        error: 'Failed to create study session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default withAuth(handler); 