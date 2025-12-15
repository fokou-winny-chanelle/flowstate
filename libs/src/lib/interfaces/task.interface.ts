/**
 * Core Task interface shared between frontend and backend
 * This interface represents a task in the FlowState application
 */
export interface ITask {
  /** Unique identifier for the task */
  id: string;
  
  /** Task title/name */
  title: string;
  
  /** Optional detailed description */
  description?: string;
  
  /** Whether the task has been completed */
  isCompleted: boolean;
  
  /** Optional due date */
  dueDate?: Date | string;
  
  /** Optional priority level (1-5, where 5 is highest) */
  priority?: number;
  
  /** Optional tags for categorization */
  tags?: string[];
  
  /** Timestamp when the task was created */
  createdAt: Date | string;
  
  /** Timestamp when the task was last updated */
  updatedAt: Date | string;
  
  /** Optional project identifier */
  projectId?: string;
  
  /** Optional estimated duration in minutes */
  estimatedDuration?: number;
  
  /** Optional energy level required (low, medium, high) */
  energyLevel?: 'low' | 'medium' | 'high';
}

