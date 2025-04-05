import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import User from './User';
import StudyPlan from './StudyPlan';
import { safeModelInit } from './modelHelper';

interface StudySessionAttributes {
  id: number;
  userId: number;
  studyPlanId: number;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class StudySession extends Model<StudySessionAttributes> implements StudySessionAttributes {
  public id!: number;
  public userId!: number;
  public studyPlanId!: number;
  public title!: string;
  public startTime!: Date;
  public endTime!: Date;
  public duration!: number;
  public notes!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Safely initialize the model
safeModelInit(
  // Server-side initialization
  () => {
    StudySession.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: User,
            key: 'id',
          },
        },
        studyPlanId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: StudyPlan,
            key: 'id',
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        duration: {
          type: DataTypes.INTEGER, // Duration in minutes
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'StudySession',
        tableName: 'study_sessions',
      }
    );

    // Define associations
    StudySession.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(StudySession, { foreignKey: 'userId' });
    
    StudySession.belongsTo(StudyPlan, { foreignKey: 'studyPlanId' });
    StudyPlan.hasMany(StudySession, { foreignKey: 'studyPlanId' });
  },
  // Browser-side placeholder
  () => {
    sequelize.define('StudySession', {}, {});
  }
);

export default StudySession; 