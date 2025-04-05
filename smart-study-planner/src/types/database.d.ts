// Database type definitions

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      DATABASE_URL?: string;
    }
  }
}

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlanAttributes {
  id: number;
  userId: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyMaterialAttributes {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySessionAttributes {
  id: number;
  userId: number;
  studyPlanId: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyRecommendationAttributes {
  id: number;
  userId: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
} 