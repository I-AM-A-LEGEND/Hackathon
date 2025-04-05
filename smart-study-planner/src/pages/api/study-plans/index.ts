import { NextApiResponse } from 'next';
import StudyPlan from '../../../database/models/StudyPlan';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth';
import { safeModelCreate, ensureField, processModelsForAPI } from '../../../database/models/modelHelper';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Check the HTTP method
  if (req.method === 'GET') {
    return await getStudyPlans(req, res);
  } else if (req.method === 'POST') {
    return await createStudyPlan(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

async function getStudyPlans(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch study plans for the authenticated user
    const studyPlans = await StudyPlan.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    // Return the study plans
    return res.status(200).json({
      success: true,
      studyPlans: processModelsForAPI(studyPlans),
    });
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}

async function createStudyPlan(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate request body
    const { title, description, startDate, endDate, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    
    // Create the study plan
    const studyPlan = await StudyPlan.create(safeModelCreate({
      userId: req.user.id,
      title: ensureField(title, ''),
      description: ensureField(description, ''),
      startDate,
      endDate,
      status: ensureField(status, 'pending')
    }));

    // Return the created study plan
    return res.status(201).json({
      success: true,
      studyPlan: studyPlan ? studyPlan.toJSON() : null,
    });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}

export default withAuth(handler); 