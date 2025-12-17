import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContainerComponent } from '../../../../shared/layout/container/container.component';

@Component({
  selector: 'flow-goals-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ContainerComponent],
  template: `
    <flow-container>
      <div class="goals-page">
        <h1>Goals</h1>
        <p>Goals page coming soon...</p>
      </div>
    </flow-container>
  `,
  styles: [
    `
      .goals-page {
        padding: var(--space-xl) 0;
      }

      h1 {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-lg) 0;
      }
    `,
  ],
})
export class GoalsListComponent {}
