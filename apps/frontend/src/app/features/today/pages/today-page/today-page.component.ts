import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TasksApiService } from '../../../../core/services/api/tasks-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';

@Component({
  selector: 'flow-today-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  template: `
    <div class="today-page">
      <header class="page-header">
        <div class="greeting">
          <h1>Good {{ timeOfDay }}, {{ userName() }}</h1>
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
          @if (tasks.length > 0) {
            <flow-card title="Today's Focus" variant="elevated">
              <div class="task-list">
                @for (task of tasks; track task.id) {
                  <div
                    class="task-item"
                    [class.completed]="task.isCompleted">
                    <input
                      type="checkbox"
                      [checked]="task.isCompleted"
                      (change)="toggleTask(task.id)"
                      class="task-checkbox" />
                    <div class="task-content">
                      <div class="task-header">
                        <h3 class="task-title">{{ task.title }}</h3>
                        @if (task.priority && task.priority > 0) {
                          <flow-badge
                            variant="warning"
                            size="sm">
                            Priority
                          </flow-badge>
                        }
                      </div>
                      @if (task.description) {
                        <p class="task-description">{{ task.description }}</p>
                      }
                      <div class="task-meta">
                        @if (task.tags && task.tags.length > 0) {
                          <div class="task-tags">
                            @for (tag of task.tags; track tag) {
                              <flow-badge variant="default" size="sm">
                                {{ tag }}
                              </flow-badge>
                            }
                          </div>
                        }
                        @if (task.dueDate) {
                          <span class="task-due-date">
                            {{ task.dueDate | date : 'short' }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </flow-card>
          } @else {
            <flow-card variant="elevated">
              <div class="empty-state">
                <p class="empty-message">🎉</p>
                <p class="empty-title">Your day is clear!</p>
                <p class="empty-subtitle">
                  Enjoy this focused time, or add something new.
                </p>
                <flow-button variant="outline" (clicked)="addTask()">
                  Add first task
                </flow-button>
              </div>
            </flow-card>
          }
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

      .task-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .task-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
        padding: var(--space-md);
        background: var(--color-surface);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-muted);
        transition: all var(--transition-fast);
      }

      .task-item:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-sm);
      }

      .task-item.completed {
        opacity: 0.6;
      }

      .task-item.completed .task-title {
        text-decoration: line-through;
      }

      .task-checkbox {
        margin-top: 4px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--color-primary);
      }

      .task-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .task-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .task-title {
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }

      .task-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
      }

      .task-tags {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }

      .task-due-date {
        font-size: var(--font-size-xs);
        color: var(--color-text-tertiary);
      }

      .empty-state {
        padding: var(--space-3xl) var(--space-xl);
        text-align: center;
      }

      .empty-message {
        font-size: 48px;
        margin: 0 0 var(--space-md) 0;
      }

      .empty-title {
        font-size: var(--font-size-xl);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-sm) 0;
      }

      .empty-subtitle {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        margin: 0 0 var(--space-lg) 0;
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
  private authService = inject(AuthService);

  todayTasks = this.tasksApi.getTodayTasks();
  currentDate = new Date();

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'there';
  });

  get timeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  toggleTask(id: string) {
    const mutation = this.tasksApi.completeTask();
    mutation.mutate(id);
  }

  addTask() {
    // TODO: Implement task creation modal/drawer
    console.log('Add task clicked');
  }
}

