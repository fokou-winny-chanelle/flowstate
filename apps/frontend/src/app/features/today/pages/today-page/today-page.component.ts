import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../core/models/types';
import { TaskFilters, TasksApiService } from '../../../../core/services/api/tasks-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
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
    TaskCardComponent,
  ],
  encapsulation: ViewEncapsulation.None,
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

      @if (taskStats.isLoading() || allTasks.isLoading()) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      }

      @if (taskStats.error() || allTasks.error()) {
        <flow-card variant="elevated">
          <div class="error-state">
            <p class="error-message">
              @if (getErrorStatus() === 0) {
                Cannot connect to the server. Please ensure the backend is running on http://localhost:3000
              } @else if (getErrorStatus() === 401) {
                Authentication failed. Please log in again.
              } @else {
                Failed to load data. Please try again.
              }
            </p>
            @if (getErrorMessage()) {
              <p class="error-details">{{ getErrorMessage() }}</p>
            }
            <flow-button variant="outline" size="sm" (clicked)="refreshTasks()">
              Retry
            </flow-button>
          </div>
        </flow-card>
      }

      @if (taskStats.data() && allTasks.data()) {
        <div class="dashboard-content">
          <!-- Statistics Cards -->
          <div class="stats-section">
            <div class="stats-grid">
              <flow-card variant="elevated" class="stat-card stat-card-primary">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">Total Tasks</p>
                    <p class="stat-value">{{ taskStats.data()!.total }}</p>
                  </div>
                </div>
              </flow-card>

              <flow-card variant="elevated" class="stat-card stat-card-success">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">Completed</p>
                    <p class="stat-value">{{ taskStats.data()!.completed }}</p>
                    <p class="stat-percentage">{{ taskStats.data()!.completionRate }}%</p>
                  </div>
                </div>
              </flow-card>

              <flow-card variant="elevated" class="stat-card stat-card-warning">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">Active</p>
                    <p class="stat-value">{{ taskStats.data()!.active }}</p>
                  </div>
                </div>
              </flow-card>

              <flow-card variant="elevated" class="stat-card stat-card-error">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">Overdue</p>
                    <p class="stat-value">{{ taskStats.data()!.overdue }}</p>
                  </div>
                </div>
              </flow-card>

              <flow-card variant="elevated" class="stat-card stat-card-info">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">Today</p>
                    <p class="stat-value">{{ taskStats.data()!.today }}</p>
                  </div>
                </div>
              </flow-card>

              <flow-card variant="elevated" class="stat-card stat-card-primary">
                <div class="stat-content">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 3v18h18"></path>
                      <path d="M18 7l-5 5-4-4-3 3"></path>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <p class="stat-label">High Priority</p>
                    <p class="stat-value">{{ taskStats.data()!.highPriority }}</p>
                  </div>
                </div>
              </flow-card>
            </div>
          </div>

          <!-- Filters Section -->
          <div class="filters-section">
            <div class="filters-container">
              <div class="search-filter">
                <flow-input
                  type="text"
                  placeholder="Search tasks..."
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilters()"
                  [clearable]="true" />
              </div>
              <div class="filter-chips">
                <button
                  type="button"
                  class="filter-chip"
                  [class.active]="filters().isCompleted === false"
                  (click)="toggleStatusFilter()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Active
                </button>
                <button
                  type="button"
                  class="filter-chip"
                  [class.active]="filters().isCompleted === true"
                  (click)="toggleCompletedFilter()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Completed
                </button>
                <button
                  type="button"
                  class="filter-chip"
                  [class.active]="filters().priority === 1"
                  (click)="togglePriorityFilter()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18"></path>
                    <path d="M18 7l-5 5-4-4-3 3"></path>
                  </svg>
                  High Priority
                </button>
                @if (hasActiveFilters()) {
                  <button
                    type="button"
                    class="filter-chip filter-chip-clear"
                    (click)="clearFilters()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Clear
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Tasks Sections -->
          @if (filteredTasks().length > 0) {
            @if (organizedTasks().overdue.length > 0) {
              <div class="task-section">
                <h2 class="section-title overdue-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>Overdue</span>
                  <flow-badge variant="error" size="sm">{{ organizedTasks().overdue.length }}</flow-badge>
                </h2>
                <div class="tasks-grid">
                  @for (task of organizedTasks().overdue; track task.id) {
                    <flow-task-card 
                      [task]="task"
                      (toggle)="toggleTask($event)"
                      (edit)="editTask($event)"
                      (delete)="deleteTask($event)" />
                  }
                </div>
              </div>
            }

            @if (organizedTasks().today.length > 0) {
              <div class="task-section">
                <h2 class="section-title today-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Today</span>
                  <flow-badge variant="primary" size="sm">{{ organizedTasks().today.length }}</flow-badge>
                </h2>
                <div class="tasks-grid">
                  @for (task of organizedTasks().today; track task.id) {
                    <flow-task-card 
                      [task]="task"
                      (toggle)="toggleTask($event)"
                      (edit)="editTask($event)"
                      (delete)="deleteTask($event)" />
                  }
                </div>
              </div>
            }

            @if (organizedTasks().upcoming.length > 0) {
              <div class="task-section">
                <h2 class="section-title upcoming-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span>Upcoming</span>
                  <flow-badge variant="info" size="sm">{{ organizedTasks().upcoming.length }}</flow-badge>
                </h2>
                <div class="tasks-grid">
                  @for (task of organizedTasks().upcoming; track task.id) {
                    <flow-task-card 
                      [task]="task"
                      (toggle)="toggleTask($event)"
                      (edit)="editTask($event)"
                      (delete)="deleteTask($event)" />
                  }
                </div>
              </div>
            }

            @if (organizedTasks().noDate.length > 0) {
              <div class="task-section">
                <h2 class="section-title no-date-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="6" x2="12" y2="12"></line>
                    <line x1="16" y1="14" x2="12" y2="12"></line>
                  </svg>
                  <span>No Due Date</span>
                  <flow-badge variant="default" size="sm">{{ organizedTasks().noDate.length }}</flow-badge>
                </h2>
                <div class="tasks-grid">
                  @for (task of organizedTasks().noDate; track task.id) {
                    <flow-task-card 
                      [task]="task"
                      (toggle)="toggleTask($event)"
                      (edit)="editTask($event)"
                      (delete)="deleteTask($event)" />
                  }
                </div>
              </div>
            }
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
        </div>
      }

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
        padding: var(--space-lg);
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-lg);
        gap: var(--space-md);
      }

      .greeting h1 {
        font-size: var(--font-size-2xl);
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

      .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      .stats-section {
        margin-bottom: var(--space-lg);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: var(--space-sm);
      }

      .stat-card {
        transition: all var(--transition-fast);
        height: 100%;
        min-height: 90px;
        display: flex;
        flex-direction: column;
      }

      .stat-card:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        flex: 1;
        height: 100%;
      }

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .stat-card-primary .stat-icon {
        background-color: rgba(20, 168, 0, 0.1);
        color: var(--color-primary);
      }

      .stat-card-success .stat-icon {
        background-color: rgba(34, 197, 94, 0.1);
        color: var(--color-success);
      }

      .stat-card-warning .stat-icon {
        background-color: rgba(251, 191, 36, 0.1);
        color: var(--color-warning);
      }

      .stat-card-error .stat-icon {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
      }

      .stat-card-info .stat-icon {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
      }

      .stat-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .stat-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        margin: 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .stat-value-row {
        display: flex;
        align-items: baseline;
        gap: var(--space-xs);
      }

      .stat-value {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0;
        line-height: 1.1;
      }

      .stat-percentage {
        font-size: var(--font-size-xs);
        color: var(--color-text-tertiary);
        margin: 0;
        font-weight: 500;
      }

      .filters-section {
        margin-bottom: var(--space-md);
      }

      .filters-container {
        display: flex;
        gap: var(--space-sm);
        align-items: center;
        flex-wrap: wrap;
      }

      .search-filter {
        flex: 1;
        min-width: 240px;
      }

      .filter-chips {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
        align-items: center;
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        background-color: var(--color-surface);
        color: var(--color-text-secondary);
        font-size: var(--font-size-xs);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .filter-chip:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background-color: var(--color-primary-light);
      }

      .filter-chip.active {
        background-color: var(--color-primary);
        color: var(--color-text-inverse);
        border-color: var(--color-primary);
      }

      .filter-chip svg {
        flex-shrink: 0;
      }

      .filter-chip-clear {
        color: var(--color-error);
        border-color: var(--color-error-light);
      }

      .filter-chip-clear:hover {
        background-color: var(--color-error-light);
        border-color: var(--color-error);
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
        font-weight: var(--font-weight-medium);
        text-align: center;
      }

      .error-details {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin: var(--space-xs) 0 0 0;
        text-align: center;
      }
      }

      .task-section {
        margin-bottom: var(--space-md);
      }

      .task-section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-sm) 0;
        padding-bottom: var(--space-xs);
        border-bottom: 1px solid var(--color-border);
      }

      .section-title svg {
        flex-shrink: 0;
      }

      .section-title span {
        flex: 1;
      }

      .overdue-title {
        color: var(--color-error);
        border-bottom-color: var(--color-error);
      }

      .today-title {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      .upcoming-title {
        color: var(--color-info);
        border-bottom-color: var(--color-info);
      }

      .no-date-title {
        color: var(--color-text-secondary);
      }

      .tasks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: var(--space-sm);
      }


      .empty-state {
        padding: var(--space-3xl) var(--space-xl);
        text-align: center;
      }

      .empty-icon {
        display: flex;
        justify-content: center;
        margin: 0 0 var(--space-md) 0;
        color: var(--color-primary);
      }

      .empty-icon svg {
        width: 48px;
        height: 48px;
      }

      .empty-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0 0 var(--space-xs) 0;
      }

      .empty-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0 0 var(--space-md) 0;
      }

      @media (max-width: 768px) {
        .today-page {
          padding: var(--space-sm);
        }

        .page-header {
          flex-direction: column;
          gap: var(--space-sm);
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-xs);
        }

        .tasks-grid {
          grid-template-columns: 1fr;
          gap: var(--space-xs);
        }
      }
    `,
  ],
})
export class TodayPageComponent {
  private tasksApi = inject(TasksApiService);
  private authService = inject(AuthService);

  // Get all tasks (both completed and active) - filtering will be done in computed
  allTasks = this.tasksApi.getTasks();
  taskStats = this.tasksApi.getTaskStats();
  currentDate = new Date();
  searchQuery = signal('');
  filters = signal<TaskFilters>({});
  isModalOpen = signal(false);
  selectedTask = signal<Task | undefined>(undefined);
  
  // Mutations - must be initialized as class properties (injection context)
  private updateTaskMutation = this.tasksApi.updateTask();
  private deleteTaskMutation = this.tasksApi.deleteTask();

  userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.fullName || user?.email?.split('@')[0] || 'there';
  });

  filteredTasks = computed(() => {
    const tasks = this.allTasks.data() || [];
    const query = this.searchQuery().toLowerCase();
    const currentFilters = this.filters();

    return tasks.filter((task) => {
      if (query && !task.title.toLowerCase().includes(query) && 
          !task.description?.toLowerCase().includes(query)) {
        return false;
      }

      // Filter by completion status - if no filter is set, show all tasks
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

  organizedTasks = computed(() => {
    const tasks = this.filteredTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    const upcoming: Task[] = [];
    const noDate: Task[] = [];

    tasks.forEach((task) => {
      if (!task.dueDate) {
        noDate.push(task);
      } else {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          overdue.push(task);
        } else if (dueDate >= today && dueDate < tomorrow) {
          todayTasks.push(task);
        } else {
          upcoming.push(task);
        }
      }
    });

    const sortByStatusAndPriority = (a: Task, b: Task) => {
      // Non-completed tasks first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then by priority (1 = highest, then 2, then null)
      const aPriority = a.priority ?? 999;
      const bPriority = b.priority ?? 999;
      return aPriority - bPriority;
    };

    return {
      overdue: overdue.sort(sortByStatusAndPriority),
      today: todayTasks.sort(sortByStatusAndPriority),
      upcoming: upcoming.sort(sortByStatusAndPriority),
      noDate: noDate.sort(sortByStatusAndPriority),
    };
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
    this.allTasks.refetch();
    this.taskStats.refetch();
  }

  toggleTask(task: Task) {
    const newCompletedState = !task.isCompleted;
    
    this.updateTaskMutation.mutate(
      {
        id: task.id,
        data: { isCompleted: newCompletedState },
      },
      {
        onSuccess: () => {
          // Refetch to ensure consistency with backend
          this.allTasks.refetch();
          this.taskStats.refetch();
        },
        onError: (error: unknown) => {
          const errorMessage = error && typeof error === 'object' && 'error' in error
            ? (error.error as { message?: string })?.message || 'Failed to toggle task status. Please try again.'
            : 'Failed to toggle task status. Please try again.';
          console.error('Error toggling task:', error);
          alert(errorMessage);
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
      this.deleteTaskMutation.mutate(id, {
        onSuccess: () => {
          this.allTasks.refetch();
          this.taskStats.refetch();
        },
        onError: (error: unknown) => {
          const errorMessage = error && typeof error === 'object' && 'error' in error
            ? (error.error as { message?: string })?.message || 'Failed to delete task. Please try again.'
            : 'Failed to delete task. Please try again.';
          alert(errorMessage);
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
    this.allTasks.refetch();
    this.taskStats.refetch();
  }


  getErrorStatus(): number | null {
    const error = this.taskStats.error() || this.allTasks.error();
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status;
    }
    return null;
  }

  getErrorMessage(): string | null {
    const error = this.taskStats.error() || this.allTasks.error();
    if (error && typeof error === 'object') {
      if ('message' in error) {
        return (error as { message: string }).message;
      }
      if ('error' in error && typeof (error as { error: unknown }).error === 'object') {
        const innerError = (error as { error: { message?: string } }).error;
        if (innerError?.message) {
          return innerError.message;
        }
      }
    }
    return null;
  }
}
