import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    injectMutation,
    injectQuery,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FocusSession } from '../../models/types';
import { QueryClientService } from '../query-client.service';

export interface CreateFocusSessionDto {
  taskId?: string;
  duration: number;
}

export interface UpdateFocusSessionDto {
  endTime?: string;
  focusRating?: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class FocusSessionsApiService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClientService).getClient();
  private apiUrl = `${environment.apiUrl}/focus-sessions`;

  getFocusSessions(filters?: { startDate?: string; endDate?: string }) {
    return injectQuery(() => ({
      queryKey: ['focus-sessions', filters],
      queryFn: () => {
        const params: Record<string, string> = {};
        if (filters?.startDate) params['startDate'] = filters.startDate;
        if (filters?.endDate) params['endDate'] = filters.endDate;
        return firstValueFrom(this.http.get<FocusSession[]>(this.apiUrl, { params }));
      },
    }));
  }

  getFocusSession(id: string) {
    return injectQuery(() => ({
      queryKey: ['focus-sessions', id],
      queryFn: () => firstValueFrom(this.http.get<FocusSession>(`${this.apiUrl}/${id}`)),
      enabled: !!id,
    }));
  }

  createFocusSession() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: CreateFocusSessionDto) =>
        firstValueFrom(this.http.post<FocusSession>(this.apiUrl, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      },
    }));
  }

  updateFocusSession() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({ id, data }: { id: string; data: UpdateFocusSessionDto }) =>
        firstValueFrom(this.http.patch<FocusSession>(`${this.apiUrl}/${id}`, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      },
    }));
  }
}

