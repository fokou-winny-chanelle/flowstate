import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  QueryClient,
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
  private queryClient: QueryClient;
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor() {
    this.queryClient = inject(QueryClientService).getClient();
  }

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

  createTask() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (data: CreateTaskDto) => this.http.post<Task>(this.apiUrl, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }

  createTaskFromNlp() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (input: string) =>
        this.http.post<Task>(`${this.apiUrl}/from-nlp`, { input }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }

  updateTask() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskDto> }) =>
        this.http.patch<Task>(`${this.apiUrl}/${id}`, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }

  completeTask() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (id: string) =>
        this.http.post<Task>(`${this.apiUrl}/${id}/complete`, {}),
      onMutate: async (id: string) => {
        await client.cancelQueries({ queryKey: ['tasks'] });
        const prev = client.getQueryData<Task[]>(['tasks', 'all']);
        if (prev) {
          client.setQueryData<Task[]>(
            ['tasks', 'all'],
            prev.map((t) => (t.id === id ? { ...t, isCompleted: true } : t))
          );
        }
        return { prev };
      },
      onError: (_, __, context) => {
        if (context?.prev) client.setQueryData(['tasks', 'all'], context.prev);
      },
      onSettled: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }

  snoozeTask() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: ({ id, until }: { id: string; until: string }) =>
        this.http.post<Task>(`${this.apiUrl}/${id}/snooze`, { until }),
      onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }

  deleteTask() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (id: string) => this.http.delete(`${this.apiUrl}/${id}`),
      onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }),
    }));
  }
}
