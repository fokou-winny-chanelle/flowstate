import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    injectMutation,
    injectQuery
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
  private queryClient = inject(QueryClientService).getClient();
  private apiUrl = `${environment.apiUrl}/goals`;

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
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: CreateGoalDto) =>
        this.http.post<Goal>(this.apiUrl, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    }));
  }

  updateGoal() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalDto> }) =>
        this.http.patch<Goal>(`${this.apiUrl}/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    }));
  }

  deleteGoal() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) => this.http.delete(`${this.apiUrl}/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    }));
  }

  recalculateProgress(id: string) {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: () =>
        this.http.post<Goal>(`${this.apiUrl}/${id}/recalculate-progress`, {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      },
    }));
  }
}

