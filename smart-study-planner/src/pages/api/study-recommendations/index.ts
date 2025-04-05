import { NextApiResponse } from 'next';
import StudyRecommendation from '../../../database/models/StudyRecommendation';
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

      const recommendations = await StudyRecommendation.findAll({
        where: { studyPlanId: planId },
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });
      
      return res.status(200).json({
        success: true,
        recommendations: processModelsForAPI(recommendations)
      });
    } catch (error) {
      console.error('Error fetching study recommendations:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch study recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, content, priority, title = 'Study Recommendation' } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
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

      const recommendation = await StudyRecommendation.create(safeModelCreate({
        studyPlanId: planId,
        userId: userId,
        title: ensureField(title, 'Study Recommendation'),
        type: ensureField(type, 'suggestion'),
        content: ensureField(content, ''),
        priority: ensureField(priority, 'medium'),
        status: 'pending',
        isApplied: false
      }));

      return res.status(201).json({
        success: true,
        recommendation: recommendation ? recommendation.toJSON() : null
      });
    } catch (error) {
      console.error('Error creating study recommendation:', error);
      return res.status(500).json({ 
        error: 'Failed to create study recommendation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, isApplied } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Recommendation ID is required' });
      }
      
      // Check if the study plan belongs to the user first
      const studyPlan = await StudyPlan.findOne({
        where: { 
          id: planId,
          userId: userId 
        }
      });

      if (!studyPlan) {
        return res.status(404).json({ error: 'Study plan not found or access denied' });
      }

      const recommendation = await StudyRecommendation.findOne({
        where: { 
          id,
          studyPlanId: planId
        }
      });

      if (!recommendation) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }

      await recommendation.update({ isApplied: !!isApplied });
      
      return res.status(200).json({
        success: true,
        recommendation: recommendation.toJSON()
      });
    } catch (error) {
      console.error('Error updating study recommendation:', error);
      return res.status(500).json({ 
        error: 'Failed to update study recommendation',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default withAuth(handler); 