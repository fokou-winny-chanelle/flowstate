import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../core/models/types';
import { TaskFilters, TasksApiService } from '../../../../core/services/api/tasks-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';

@Component({
  selector: 'flow-today-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    TaskFormModalComponent,
  ],
  template: `
    <div class="today-page">
      <header class="page-header">
        <div class="greeting">
          <h1>Good {{ timeOfDay }}, {{ userName() }}</h1>
          <p class="date">{{ currentDate | date : 'EEEE, MMMM d' }}</p>
        </div>
        <div class="header-actions">
          <flow-button
            variant="solid"
            size="md"
            (clicked)="openCreateTaskModal()">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Task
          </flow-button>
        </div>
      </header>

      <div class="filters-section">
        <div class="filters-row">
          <div class="search-filter">
            <flow-input
              type="text"
              placeholder="Search tasks..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyFilters()"
              [clearable]="true" />
          </div>
          <div class="filter-buttons">
            <flow-button
              variant="ghost"
              size="sm"
              [variant]="filters().isCompleted === false ? 'solid' : 'ghost'"
              (clicked)="toggleStatusFilter()">
              Active
            </flow-button>
            <flow-button
              variant="ghost"
              size="sm"
              [variant]="filters().isCompleted === true ? 'solid' : 'ghost'"
              (clicked)="toggleCompletedFilter()">
              Completed
            </flow-button>
            <flow-button
              variant="ghost"
              size="sm"
              [variant]="filters().priority === 1 ? 'solid' : 'ghost'"
              (clicked)="togglePriorityFilter()">
              High Priority
            </flow-button>
            @if (hasActiveFilters()) {
              <flow-button
                variant="ghost"
                size="sm"
                (clicked)="clearFilters()">
                Clear
              </flow-button>
            }
          </div>
        </div>
      </div>

      <div class="today-content">
        @if (todayTasks.isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        }

        @if (todayTasks.error()) {
          <flow-card variant="elevated">
            <div class="error-state">
              <p class="error-message">Failed to load tasks. Please try again.</p>
              <flow-button variant="outline" size="sm" (clicked)="refreshTasks()">
                Retry
              </flow-button>
            </div>
          </flow-card>
        }

        @if (todayTasks.data(); as tasks) {
          @if (filteredTasks().length > 0) {
            <div class="tasks-grid">
              @for (task of filteredTasks(); track task.id) {
                <flow-card
                  variant="elevated"
                  [class.completed]="task.isCompleted"
                  class="task-card">
                  <div class="task-card-content">
                    <div class="task-header-row">
                      <input
                        type="checkbox"
                        [checked]="task.isCompleted"
                        (change)="toggleTask(task)"
                        class="task-checkbox"
                        [attr.aria-label]="'Mark task ' + task.title + ' as ' + (task.isCompleted ? 'incomplete' : 'complete')" />
                      <div class="task-title-section">
                        <h3 class="task-title" [class.completed]="task.isCompleted">
                          {{ task.title }}
                        </h3>
                        @if (task.priority === 1) {
                          <flow-badge variant="error" size="sm">High Priority</flow-badge>
                        } @else if (task.priority === 2) {
                          <flow-badge variant="warning" size="sm">Medium</flow-badge>
                        }
                      </div>
                    </div>

                    @if (task.description) {
                      <p class="task-description">{{ task.description }}</p>
                    }

                    <div class="task-meta">
                      @if (task.tags && task.tags.length > 0) {
                        <div class="task-tags">
                          @for (tag of task.tags; track tag) {
                            <flow-badge variant="default" size="xs">{{ tag }}</flow-badge>
                          }
                        </div>
                      }
                      @if (task.dueDate) {
                        <span class="task-due-date">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          {{ task.dueDate | date : 'short' }}
                        </span>
                      }
                      @if (task.energyLevel) {
                        <flow-badge
                          [variant]="getEnergyBadgeVariant(task.energyLevel)"
                          size="xs">
                          {{ task.energyLevel }}
                        </flow-badge>
                      }
                    </div>

                    <div class="task-actions">
                      <flow-button
                        variant="ghost"
                        size="sm"
                        [iconOnly]="true"
                        (clicked)="editTask(task)"
                        [attr.aria-label]="'Edit task ' + task.title">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </flow-button>
                      <flow-button
                        variant="ghost"
                        size="sm"
                        [iconOnly]="true"
                        (clicked)="deleteTask(task.id)"
                        [attr.aria-label]="'Delete task ' + task.title">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </flow-button>
                    </div>
                  </div>
                </flow-card>
              }
            </div>
          } @else {
            <flow-card variant="elevated">
              <div class="empty-state">
                <div class="empty-icon">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p class="empty-title">Your day is clear!</p>
                <p class="empty-subtitle">
                  @if (hasActiveFilters()) {
                    No tasks match your filters. Try adjusting them.
                  } @else {
                    Enjoy this focused time, or add something new.
                  }
                </p>
                <flow-button variant="solid" (clicked)="openCreateTaskModal()">
                  Add first task
                </flow-button>
              </div>
            </flow-card>
          }
        }
      </div>

      <flow-task-form-modal
        [isOpen]="isModalOpen()"
        [task]="selectedTask()"
        (closed)="closeModal()"
        (saved)="handleTaskSaved()" />
    </div>
  `,
  styles: [
    `
      .today-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: var(--space-xl);
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-2xl);
        gap: var(--space-lg);
      }

      .greeting h1 {
        font-size: var(--font-size-3xl);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xs) 0;
        line-height: 1.2;
      }

      .date {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: var(--space-sm);
        align-items: flex-start;
      }

      .filters-section {
        margin-bottom: var(--space-xl);
      }

      .filters-row {
        display: flex;
        gap: var(--space-md);
        align-items: center;
        flex-wrap: wrap;
      }

      .search-filter {
        flex: 1;
        min-width: 200px;
      }

      .filter-buttons {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
        align-items: center;
      }

      .today-content {
        width: 100%;
      }

      .loading-state,
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-3xl);
        gap: var(--space-md);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-muted);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-message {
        color: var(--color-error);
        margin: 0;
      }

      .tasks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: var(--space-lg);
      }

      .task-card {
        transition: all var(--transition-fast);
      }

      .task-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      .task-card.completed {
        opacity: 0.7;
      }

      .task-card-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .task-header-row {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
      }

      .task-checkbox {
        margin-top: 4px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--color-primary);
        flex-shrink: 0;
      }

      .task-title-section {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
      }

      .task-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
        flex: 1;
      }

      .task-title.completed {
        text-decoration: line-through;
        color: var(--color-text-secondary);
      }

      .task-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.5;
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
        padding-top: var(--space-sm);
        border-top: 1px solid var(--color-border);
      }

      .task-tags {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }

      .task-due-date {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: var(--font-size-xs);
        color: var(--color-text-tertiary);
      }

      .task-actions {
        display: flex;
        gap: var(--space-xs);
        justify-content: flex-end;
        padding-top: var(--space-sm);
        border-top: 1px solid var(--color-border);
      }

      .empty-state {
        padding: var(--space-3xl) var(--space-xl);
        text-align: center;
      }

      .empty-icon {
        display: flex;
        justify-content: center;
        margin: 0 0 var(--space-lg) 0;
        color: var(--color-primary);
      }

      .empty-icon svg {
        width: 64px;
        height: 64px;
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

      @media (max-width: 768px) {
        .today-page {
          padding: var(--space-md);
        }

        .page-header {
          flex-direction: column;
        }

        .tasks-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TodayPageComponent {
  private tasksApi = inject(TasksApiService);
  private authService = inject(AuthService);

  todayTasks = this.tasksApi.getTodayTasks();
  currentDate = new Date();
  searchQuery = signal('');
  filters = signal<TaskFilters>({});
  isModalOpen = signal(false);
  selectedTask = signal<Task | undefined>(undefined);

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'there';
  });

  filteredTasks = computed(() => {
    const tasks = this.todayTasks.data() || [];
    const query = this.searchQuery().toLowerCase();
    const currentFilters = this.filters();

    return tasks.filter((task) => {
      if (query && !task.title.toLowerCase().includes(query) && 
          !task.description?.toLowerCase().includes(query)) {
        return false;
      }

      if (currentFilters.isCompleted !== undefined && 
          task.isCompleted !== currentFilters.isCompleted) {
        return false;
      }

      if (currentFilters.priority !== undefined && 
          task.priority !== currentFilters.priority) {
        return false;
      }

      return true;
    });
  });

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return f.isCompleted !== undefined || f.priority !== undefined || 
           this.searchQuery().length > 0;
  });

  get timeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  applyFilters() {
    // Filters are applied in computed filteredTasks
  }

  toggleStatusFilter() {
    const current = this.filters();
    if (current.isCompleted === false) {
      this.filters.set({ ...current, isCompleted: undefined });
    } else {
      this.filters.set({ ...current, isCompleted: false });
    }
  }

  toggleCompletedFilter() {
    const current = this.filters();
    if (current.isCompleted === true) {
      this.filters.set({ ...current, isCompleted: undefined });
    } else {
      this.filters.set({ ...current, isCompleted: true });
    }
  }

  togglePriorityFilter() {
    const current = this.filters();
    if (current.priority === 1) {
      this.filters.set({ ...current, priority: undefined });
    } else {
      this.filters.set({ ...current, priority: 1 });
    }
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filters.set({});
  }

  refreshTasks() {
    this.todayTasks.refetch();
  }

  toggleTask(task: Task) {
    const updateMutation = this.tasksApi.updateTask();
    updateMutation.mutate(
      {
        id: task.id,
        data: { isCompleted: !task.isCompleted },
      },
      {
        onError: (error: any) => {
          alert(
            error?.error?.message || 'Failed to update task. Please try again.'
          );
        },
      }
    );
  }

  editTask(task: Task) {
    this.selectedTask.set(task);
    this.isModalOpen.set(true);
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      const deleteMutation = this.tasksApi.deleteTask();
      deleteMutation.mutate(id, {
        onError: (error: any) => {
          alert(
            error?.error?.message || 'Failed to delete task. Please try again.'
          );
        },
      });
    }
  }

  openCreateTaskModal() {
    this.selectedTask.set(undefined);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedTask.set(undefined);
  }

  handleTaskSaved() {
    this.todayTasks.refetch();
  }

  getEnergyBadgeVariant(level: string): 'default' | 'success' | 'warning' | 'error' {
    switch (level) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  }
}
