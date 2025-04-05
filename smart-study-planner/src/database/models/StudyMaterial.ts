import { Model, DataTypes } from 'sequelize';
import sequelize from '../config';
import StudyPlan from './StudyPlan';
import { safeModelInit } from './modelHelper';

interface StudyMaterialAttributes {
  id: number;
  studyPlanId: number;
  title: string;
  description?: string;
  url?: string;
  content?: string;
  type: 'book' | 'article' | 'video' | 'document' | 'note' | 'other';
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
}

class StudyMaterial extends Model<StudyMaterialAttributes> implements StudyMaterialAttributes {
  public id!: number;
  public studyPlanId!: number;
  public title!: string;
  public description!: string;
  public url!: string;
  public content!: string;
  public type!: 'book' | 'article' | 'video' | 'document' | 'note' | 'other';
  public priority!: 'low' | 'medium' | 'high';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Safely initialize the model
safeModelInit(
  // Server-side initialization
  () => {
    StudyMaterial.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
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
        url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        type: {
          type: DataTypes.ENUM('book', 'article', 'video', 'document', 'note', 'other'),
          defaultValue: 'other',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high'),
          defaultValue: 'medium',
        },
      },
      {
        sequelize,
        modelName: 'StudyMaterial',
        tableName: 'study_materials',
      }
    );

    // Define associations
    StudyMaterial.belongsTo(StudyPlan, { foreignKey: 'studyPlanId' });
    StudyPlan.hasMany(StudyMaterial, { foreignKey: 'studyPlanId' });
  },
  // Browser-side placeholder
  () => {
    sequelize.define('StudyMaterial', {}, {});
  }
);

export default StudyMaterial; 