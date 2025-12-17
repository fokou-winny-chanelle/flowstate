import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  injectMutation,
  injectQuery
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project } from '../../models/types';
import { QueryClientService } from '../query-client.service';

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  deadline?: string;
}

export interface AddMemberDto {
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  private http = inject(HttpClient);
  private queryClient = inject(QueryClientService).getClient();
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects() {
    return injectQuery(() => ({
      queryKey: ['projects'],
      queryFn: () => firstValueFrom(this.http.get<Project[]>(this.apiUrl)),
    }));
  }

  getProject(id: string) {
    return injectQuery(() => ({
      queryKey: ['projects', id],
      queryFn: () => firstValueFrom(this.http.get<Project>(`${this.apiUrl}/${id}`)),
      enabled: !!id,
    }));
  }

  createProject() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: CreateProjectDto) =>
        firstValueFrom(this.http.post<Project>(this.apiUrl, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    }));
  }

  updateProject() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectDto> }) =>
        firstValueFrom(this.http.patch<Project>(`${this.apiUrl}/${id}`, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    }));
  }

  deleteProject() {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (id: string) => firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    }));
  }

  addMember(projectId: string) {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: (data: AddMemberDto) =>
        firstValueFrom(this.http.post(`${this.apiUrl}/${projectId}/members`, data)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      },
    }));
  }

  updateProgress(projectId: string) {
    const queryClient = this.queryClient;
    return injectMutation(() => ({
      mutationFn: () =>
        firstValueFrom(this.http.post<{ progress: number }>(
          `${this.apiUrl}/${projectId}/update-progress`,
          {}
        )),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      },
    }));
  }
}

