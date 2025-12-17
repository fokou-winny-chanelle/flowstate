import { Route } from '@angular/router';

export const PROJECTS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/projects-list/projects-list.component').then(
        (m) => m.ProjectsListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
];
