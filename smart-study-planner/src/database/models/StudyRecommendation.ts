import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import User from './User';
import StudyPlan from './StudyPlan';
import { safeModelInit } from './modelHelper';

interface StudyRecommendationAttributes {
  id: number;
  userId: number;
  studyPlanId: number;
  title: string;
  description?: string;
  content?: string;
  type: 'resource' | 'schedule' | 'technique' | 'suggestion' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'rejected';
  isApplied?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class StudyRecommendation extends Model<StudyRecommendationAttributes> implements StudyRecommendationAttributes {
  public id!: number;
  public userId!: number;
  public studyPlanId!: number;
  public title!: string;
  public description!: string;
  public content!: string;
  public type!: 'resource' | 'schedule' | 'technique' | 'suggestion' | 'other';
  public priority!: 'low' | 'medium' | 'high';
  public status!: 'pending' | 'accepted' | 'rejected';
  public isApplied!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Safely initialize the model
safeModelInit(
  // Server-side initialization
  () => {
    StudyRecommendation.init(
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
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM('resource', 'schedule', 'technique', 'suggestion', 'other'),
          defaultValue: 'other',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high'),
          defaultValue: 'medium',
        },
        status: {
          type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
          defaultValue: 'pending',
        },
        isApplied: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'StudyRecommendation',
        tableName: 'study_recommendations',
      }
    );

    // Define associations
    StudyRecommendation.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(StudyRecommendation, { foreignKey: 'userId' });
    
    StudyRecommendation.belongsTo(StudyPlan, { foreignKey: 'studyPlanId' });
    StudyPlan.hasMany(StudyRecommendation, { foreignKey: 'studyPlanId' });
  },
  // Browser-side placeholder
  () => {
    sequelize.define('StudyRecommendation', {}, {});
  }
);

export default StudyRecommendation; 