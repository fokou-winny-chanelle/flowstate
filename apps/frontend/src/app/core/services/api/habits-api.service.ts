import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    injectMutation,
    injectQuery,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Habit } from '../../models/types';
import { QueryClientService } from '../query-client.service';

export interface CreateHabitDto {
  name: string;
  schedule: {
    days: string[];
    time?: string;
  };
  goalId?: string;
}

@Injectable({ providedIn: 'root' })
export class HabitsApiService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClientService).getClient();
  private apiUrl = `${environment.apiUrl}/habits`;

  getHabits() {
    return injectQuery(() => ({
      queryKey: ['habits'],
      queryFn: () => firstValueFrom(this.http.get<Habit[]>(this.apiUrl)),
    }));
  }

  getHabit(id: string) {
    return injectQuery(() => ({
      queryKey: ['habits', id],
      queryFn: () => firstValueFrom(this.http.get<Habit>(`${this.apiUrl}/${id}`)),
      enabled: !!id,
    }));
  }

  createHabit() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: CreateHabitDto) =>
        firstValueFrom(this.http.post<Habit>(this.apiUrl, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      },
    }));
  }

  updateHabit() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<CreateHabitDto>;
      }) =>
        firstValueFrom(this.http.patch<Habit>(`${this.apiUrl}/${id}`, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      },
    }));
  }

  deleteHabit() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) => firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      },
    }));
  }

  markComplete() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) =>
        firstValueFrom(this.http.post<Habit>(`${this.apiUrl}/${id}/complete`, {})),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['habits'] });
      },
    }));
  }
}

