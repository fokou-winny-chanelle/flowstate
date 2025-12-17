import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksApiService } from '../../../../core/services/api/tasks-api.service';

@Component({
  selector: 'fs-today-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="today-page">
      <header class="page-header">
        <div class="greeting">
          <h1>Good {{ timeOfDay }}, {{ userName }}</h1>
          <p class="date">{{ currentDate | date : 'EEEE, MMMM d' }}</p>
        </div>
      </header>

      <div class="today-content">
        @if (todayTasks.isLoading()) {
          <div class="loading">Loading your tasks...</div>
        }

        @if (todayTasks.error()) {
          <div class="error">Failed to load tasks</div>
        }

        @if (todayTasks.data(); as tasks) {
          <section class="focus-section">
            <h2>Today's Focus</h2>
            <div class="task-list">
              @for (task of tasks; track task.id) {
                <div class="task-card">
                  <input type="checkbox" [checked]="task.isCompleted" />
                  <div class="task-info">
                    <h3>{{ task.title }}</h3>
                    @if (task.description) {
                      <p>{{ task.description }}</p>
                    }
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p>No tasks for today. You're all clear!</p>
                </div>
              }
            </div>
          </section>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .today-page {
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: var(--space-2xl);
      }

      .greeting h1 {
        font-size: var(--font-size-3xl);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xs) 0;
      }

      .date {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .focus-section h2 {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-lg) 0;
      }

      .task-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .task-card {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
        padding: var(--space-lg);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
      }

      .task-card:hover {
        box-shadow: var(--shadow-md);
      }

      .task-info h3 {
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xs) 0;
      }

      .task-info p {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .loading,
      .error,
      .empty-state {
        padding: var(--space-2xl);
        text-align: center;
        color: var(--color-text-secondary);
      }

      .error {
        color: var(--color-error);
      }
    `,
  ],
})
export class TodayPageComponent {
  private tasksApi = inject(TasksApiService);

  todayTasks = this.tasksApi.getTodayTasks();
  userName = 'there';
  currentDate = new Date();

  get timeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}
