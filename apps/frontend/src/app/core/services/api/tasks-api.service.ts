import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    injectMutation,
    injectQuery
} from '@tanstack/angular-query-experimental';
import { environment } from '../../../../environments/environment';
import { Task } from '../../models/types';
import { QueryClientService } from '../query-client.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: string;
  priority?: number;
  tags?: string[];
  projectId?: string;
  goalId?: string;
  estimatedDuration?: number;
  energyLevel?: 'low' | 'medium' | 'high';
}

export interface TaskFilters {
  isCompleted?: boolean;
  projectId?: string;
  goalId?: string;
  tags?: string[];
  priority?: number;
  energyLevel?: string;
}

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClientService).getClient();
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(filters?: TaskFilters) {
    return injectQuery(() => ({
      queryKey: ['tasks', 'all', filters],
      queryFn: () => {
        const params: Record<string, string> = {};
        if (filters?.isCompleted !== undefined)
          params['isCompleted'] = filters.isCompleted.toString();
        if (filters?.projectId) params['projectId'] = filters.projectId;
        if (filters?.goalId) params['goalId'] = filters.goalId;
        if (filters?.tags) params['tags'] = filters.tags.join(',');
        if (filters?.priority) params['priority'] = filters.priority.toString();
        if (filters?.energyLevel) params['energyLevel'] = filters.energyLevel;

        return this.http.get<Task[]>(this.apiUrl, { params });
      },
    }));
  }

  getTodayTasks() {
    return injectQuery(() => ({
      queryKey: ['tasks', 'today'],
      queryFn: () => this.http.get<Task[]>(`${this.apiUrl}/today`),
    }));
  }

  getUpcomingTasks(days = 7) {
    return injectQuery(() => ({
      queryKey: ['tasks', 'upcoming', days],
      queryFn: () =>
        this.http.get<Task[]>(`${this.apiUrl}/upcoming`, {
          params: { days: days.toString() },
        }),
    }));
  }

  getTask(id: string) {
    return injectQuery(() => ({
      queryKey: ['tasks', id],
      queryFn: () => this.http.get<Task>(`${this.apiUrl}/${id}`),
      enabled: !!id,
    }));
  }

  createTask() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: CreateTaskDto) =>
        this.http.post<Task>(this.apiUrl, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }

  createTaskFromNlp() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (input: string) =>
        this.http.post<Task>(`${this.apiUrl}/from-nlp`, { input }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }

  updateTask() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskDto> }) =>
        this.http.patch<Task>(`${this.apiUrl}/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }

  completeTask() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) =>
        this.http.post<Task>(`${this.apiUrl}/${id}/complete`, {}),
      onMutate: async (id: string) => {
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        const previousTasks = queryClient.getQueryData<Task[]>(['tasks', 'all']);
        if (previousTasks) {
          queryClient.setQueryData<Task[]>(
            ['tasks', 'all'],
            previousTasks.map((t) =>
              t.id === id ? { ...t, isCompleted: true } : t
            )
          );
        }
        return { previousTasks };
      },
      onError: (_, __, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData(['tasks', 'all'], context.previousTasks);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }

  snoozeTask() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({ id, until }: { id: string; until: string }) =>
        this.http.post<Task>(`${this.apiUrl}/${id}/snooze`, { until }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }

  deleteTask() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) => this.http.delete(`${this.apiUrl}/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    }));
  }
}

