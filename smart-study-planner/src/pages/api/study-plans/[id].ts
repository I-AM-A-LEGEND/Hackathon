import { NextApiResponse } from 'next';
import StudyPlan from '../../../database/models/StudyPlan';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { ensureField, processModelsForAPI } from '../../../database/models/modelHelper';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const studyPlanId = parseInt(id as string);

  if (isNaN(studyPlanId)) {
    return res.status(400).json({ error: 'Invalid study plan ID' });
  }

  // Ensure user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const studyPlan = await StudyPlan.findOne({
      where: { id: studyPlanId, userId: req.user.id },
    });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found or access denied' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        studyPlan: processModelsForAPI([studyPlan])[0],
      });
    }

    if (req.method === 'PUT') {
      const { title, description, startDate, endDate, status } = req.body;

      // Update study plan
      await studyPlan.update({
        title: ensureField(title, studyPlan.title),
        description: ensureField(description, studyPlan.description),
        startDate: startDate ? new Date(startDate) : studyPlan.startDate,
        endDate: endDate ? new Date(endDate) : studyPlan.endDate,
        status: ensureField(status, studyPlan.status),
      });

      await studyPlan.reload();

      return res.status(200).json({
        success: true,
        studyPlan: studyPlan.toJSON(),
      });
    }

    if (req.method === 'DELETE') {
      await studyPlan.destroy();
      return res.status(200).json({
        success: true,
        message: 'Study plan deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Study plan operation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export default withAuth(handler); 