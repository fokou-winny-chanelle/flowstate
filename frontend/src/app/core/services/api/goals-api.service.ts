import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { environment } from '../../../../environments/environment';
import { Goal } from '../../models/types';
import { QueryClientService } from '../query-client.service';

export interface CreateGoalDto {
  title: string;
  type?: 'outcome' | 'habit' | 'system';
  targetDate?: string;
  projectId?: string;
  progress?: number;
}

@Injectable({ providedIn: 'root' })
export class GoalsApiService {
  private http = inject(HttpClient);
  private queryClient: QueryClient;
  private apiUrl = `${environment.apiUrl}/goals`;

  constructor() {
    this.queryClient = inject(QueryClientService).getClient();
  }

  getGoals() {
    return injectQuery(() => ({
      queryKey: ['goals'],
      queryFn: () => this.http.get<Goal[]>(this.apiUrl),
    }));
  }

  getGoal(id: string) {
    return injectQuery(() => ({
      queryKey: ['goals', id],
      queryFn: () => this.http.get<Goal>(`${this.apiUrl}/${id}`),
      enabled: !!id,
    }));
  }

  createGoal() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (data: CreateGoalDto) => this.http.post<Goal>(this.apiUrl, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }),
    }));
  }

  updateGoal() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalDto> }) =>
        this.http.patch<Goal>(`${this.apiUrl}/${id}`, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }),
    }));
  }

  deleteGoal() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (id: string) => this.http.delete(`${this.apiUrl}/${id}`),
      onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }),
    }));
  }

  recalculateProgress(id: string) {
    return injectMutation((client: QueryClient) => ({
      mutationFn: () =>
        this.http.post<Goal>(`${this.apiUrl}/${id}/recalculate-progress`, {}),
      onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }),
    }));
  }
}
