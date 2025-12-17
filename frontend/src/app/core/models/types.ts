export interface User {
  id: string;
  email: string;
  name?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'snoozed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  estimatedDuration?: number; // en minutes
  actualDuration?: number;
  isCompleted: boolean;
  completedAt?: Date;
  userId: string;
  projectId?: string;
  goalId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  progress: number;
  deadline?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'personal' | 'professional' | 'health' | 'other';
  progress: number;
  targetDate?: Date;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streakCurrent: number;
  streakBest: number;
  lastCompleted?: Date;
  userId: string;
  goalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  duration: number;
  actualDuration: number;
  startTime: Date;
  endTime?: Date;
  mood?: 'poor' | 'fair' | 'good' | 'great' | 'excellent';
  notes?: string;
  userId: string;
  createdAt: Date;
}

