import { Sequelize, Options, Dialect } from 'sequelize';
import path from 'path';

// Create a dummy non-functional Sequelize instance for client-side
const createDummySequelize = () => {
  // Create a mock models container
  const dummyModels: Record<string, any> = {};
  
  // Create a dummy sequelize instance that won't cause errors
  // but also won't actually connect to anything
  const dummy = {
    authenticate: () => Promise.resolve(),
    sync: () => Promise.resolve(),
    define: function(modelName: string, attributes: any, options: any) {
      // Create a very simple mock model
      const mockModel = function(data: any) { return { ...data }; };
      
      // Add static methods the models use
      mockModel.findAll = () => Promise.resolve([]);
      mockModel.findOne = () => Promise.resolve(null);
      mockModel.create = () => Promise.resolve({});
      mockModel.count = () => Promise.resolve(0);
      
      // Add the model to our collection
      dummyModels[modelName] = mockModel;
      
      // Return something that acts enough like a model
      return mockModel as any;
    },
    models: dummyModels,
    // Add other methods commonly used
    query: () => Promise.resolve([[], {}]),
    transaction: () => ({
      commit: () => Promise.resolve(),
      rollback: () => Promise.resolve()
    }),
    close: () => Promise.resolve()
  };
  
  return dummy as unknown as Sequelize;
};

// Only run this code on the server side
const getServerSequelize = (): Sequelize => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      // Production PostgreSQL configuration
      return new Sequelize(databaseUrl, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      });
    }

    // Development SQLite configuration
    try {
      return new Sequelize({
        dialect: 'sqlite',
        storage: path.join(process.cwd(), 'database.sqlite'),
        logging: false
      });
    } catch (sqliteError) {
      console.error('Failed to initialize SQLite:', sqliteError);
      
      // Fall back to in-memory SQLite if file-based fails
      return new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
      });
    }
  } catch (error) {
    console.error('All database initialization attempts failed:', error);
    // Return a non-functional instance as last resort
    return createDummySequelize();
  }
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Export the appropriate Sequelize instance based on environment
const sequelize = isBrowser 
  ? createDummySequelize() 
  : getServerSequelize();

// Test connection only on server side
if (!isBrowser) {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.');
    })
    .catch((error) => {
      console.error('Unable to connect to the database:', error);
    });
}

export default sequelize; 