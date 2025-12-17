export interface User {
  id: string;
  email: string;
  fullName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date | string;
  priority?: number;
  tags?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  projectId?: string;
  goalId?: string;
  estimatedDuration?: number;
  energyLevel?: 'low' | 'medium' | 'high';
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  deadline?: Date | string;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string;
}

export interface Goal {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  type: string;
  targetDate?: Date | string;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Habit {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  frequency: string;
  streak: number;
  bestStreak: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  duration: number;
  startTime: Date | string;
  endTime?: Date | string;
  focusRating?: number;
  notes?: string;
  createdAt: Date | string;
}

