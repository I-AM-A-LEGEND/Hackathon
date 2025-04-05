import sequelize from './config';
import User from './models/User';
import { hash } from 'bcryptjs';
// These models are imported to ensure they are registered with sequelize
import StudyPlan from './models/StudyPlan';
import StudyMaterial from './models/StudyMaterial';
import StudySession from './models/StudySession';
import StudyRecommendation from './models/StudyRecommendation';
import { safeModelCreate } from './models/modelHelper';

const initializeDatabase = async () => {
  // Skip database initialization on the client side
  if (typeof window !== 'undefined') {
    return true;
  }
  
  try {
    console.log('Starting database initialization...');
    
    // Try to authenticate to the database
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    } catch (authError) {
      console.error('Failed to connect to database:', authError);
      throw new Error('Database connection failed');
    }
    
    // Before syncing, check if there are any users to determine if this is a first run
    let isFirstRun = false;
    try {
      // Check if the users table exists and has any records
      const [results] = await sequelize.query('SELECT name FROM sqlite_master WHERE type="table" AND name="users"');
      
      if (Array.isArray(results) && results.length > 0) {
        const userCount = await User.count();
        isFirstRun = userCount === 0;
        console.log(`Database already exists. User count: ${userCount}`);
      } else {
        isFirstRun = true;
        console.log('No users table found, this appears to be a first run');
      }
    } catch (checkError) {
      // If we get an error here, it's likely because the table doesn't exist yet
      console.log('Error checking existing tables, assuming first run:', checkError);
      isFirstRun = true;
    }
    
    // Initialize and sync models with the database
    // Use force: true only on first run, otherwise use alter: true
    if (isFirstRun) {
      console.log('First run detected - creating database schema');
      await sequelize.sync({ force: true });
    } else {
      console.log('Existing database detected - updating schema');
      await sequelize.sync({ alter: true });
    }
    
    // Check if there are any users
    const userCount = await User.count();
    
    // If there are no users, create a test user
    if (userCount === 0) {
      try {
        console.log('Creating test user...');
        const hashedPassword = await hash('password123', 10);
        await User.create(safeModelCreate({
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword
        }));
        console.log('Test user created successfully');
        
        // Create some sample study plans for the test user
        const testUser = await User.findOne({ where: { email: 'test@example.com' } });
        if (testUser) {
          console.log('Creating sample study plans...');
          
          // Sample study plan 1
          const mathPlan = await StudyPlan.create(safeModelCreate({
            userId: testUser.id,
            title: 'Math Exam Preparation',
            description: 'Prepare for the upcoming calculus exam',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            status: 'in_progress'
          }));
          
          // Sample study plan 2
          await StudyPlan.create(safeModelCreate({
            userId: testUser.id,
            title: 'Programming Project',
            description: 'Learn React and build a personal project',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
            status: 'pending'
          }));
          
          // Sample study session for the math plan
          if (mathPlan) {
            await StudySession.create(safeModelCreate({
              userId: testUser.id,
              studyPlanId: mathPlan.id,
              title: 'Calculus Review',
              startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
              duration: 120,
              notes: 'Focus on integration techniques'
            }));
          }
          
          console.log('Sample data created successfully');
        }
      } catch (userError) {
        console.error('Error creating test user or sample data:', userError);
        // Continue execution even if sample data creation fails
      }
    }
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    // In production, you might want to exit the process or implement a retry mechanism
    return false;
  }
};

export default initializeDatabase; 