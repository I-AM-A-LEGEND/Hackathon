import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import User from './User';
import { safeModelInit } from './modelHelper';

interface StudyPlanAttributes {
  id: number;
  userId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

class StudyPlan extends Model<StudyPlanAttributes> implements StudyPlanAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'pending' | 'in_progress' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Safely initialize the model
safeModelInit(
  // Server-side initialization
  () => {
    StudyPlan.init(
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
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
          defaultValue: 'pending',
        },
      },
      {
        sequelize,
        modelName: 'StudyPlan',
        tableName: 'study_plans',
      }
    );

    // Define associations
    StudyPlan.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(StudyPlan, { foreignKey: 'userId' });
  },
  // Browser-side placeholder
  () => {
    sequelize.define('StudyPlan', {}, {});
  }
);

export default StudyPlan; 