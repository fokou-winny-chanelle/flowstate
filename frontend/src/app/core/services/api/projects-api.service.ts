import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
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
  private queryClient: QueryClient;
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor() {
    this.queryClient = inject(QueryClientService).getClient();
  }

  getProjects() {
    return injectQuery(() => ({
      queryKey: ['projects'],
      queryFn: () => this.http.get<Project[]>(this.apiUrl),
    }));
  }

  getProject(id: string) {
    return injectQuery(() => ({
      queryKey: ['projects', id],
      queryFn: () => this.http.get<Project>(`${this.apiUrl}/${id}`),
      enabled: !!id,
    }));
  }

  createProject() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (data: CreateProjectDto) =>
        this.http.post<Project>(this.apiUrl, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
    }));
  }

  updateProject() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectDto> }) =>
        this.http.patch<Project>(`${this.apiUrl}/${id}`, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
    }));
  }

  deleteProject() {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (id: string) => this.http.delete(`${this.apiUrl}/${id}`),
      onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
    }));
  }

  addMember(projectId: string) {
    return injectMutation((client: QueryClient) => ({
      mutationFn: (data: AddMemberDto) =>
        this.http.post(`${this.apiUrl}/${projectId}/members`, data),
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ['projects', projectId] }),
    }));
  }

  updateProgress(projectId: string) {
    return injectMutation((client: QueryClient) => ({
      mutationFn: () =>
        this.http.post<{ progress: number }>(
          `${this.apiUrl}/${projectId}/update-progress`,
          {}
        ),
      onSuccess: () =>
        client.invalidateQueries({ queryKey: ['projects', projectId] }),
    }));
  }
}
