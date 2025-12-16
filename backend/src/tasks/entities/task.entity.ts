import { ITask } from '@flowstate/shared';

/**
 * Task entity that extends the shared ITask interface
 * This ensures type consistency between frontend and backend
 */
export class TaskEntity implements ITask {
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
  estimatedDuration?: number;
  energyLevel?: 'low' | 'medium' | 'high';
}


