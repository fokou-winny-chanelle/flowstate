import { Injectable } from '@angular/core';
import { QueryClient } from '@tanstack/angular-query-experimental';

@Injectable({ providedIn: 'root' })
export class QueryClientService {
  private queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  getClient(): QueryClient {
    return this.queryClient;
  }
}

