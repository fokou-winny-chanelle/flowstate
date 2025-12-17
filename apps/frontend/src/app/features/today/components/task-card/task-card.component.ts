import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../../../core/models/types';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';

@Component({
  selector: 'flow-task-card',
  standalone: true,
  imports: [CommonModule, DatePipe, TitleCasePipe, CardComponent, BadgeComponent],
  template: `
    <flow-card variant="elevated" [class.completed]="task.isCompleted" class="task-card">
      <div class="task-card-content">
        <div class="task-header-row">
          <button 
            type="button"
            class="task-toggle"
            [class.completed]="task.isCompleted"
            (click)="onToggle()"
            [attr.aria-label]="'Mark task ' + task.title + ' as ' + (task.isCompleted ? 'incomplete' : 'complete')">
            <span class="toggle-slider"></span>
          </button>
          <div class="task-title-section">
            <div class="task-title-row">
              <h3 class="task-title" [class.completed]="task.isCompleted">{{ task.title }}</h3>
              @if (task.priority === 1) {
                <span class="task-priority-badge priority-high">High</span>
              } @else if (task.priority === 2) {
                <span class="task-priority-badge priority-medium">Medium</span>
              }
              <span class="task-status-badge" [class.completed]="task.isCompleted" [class.active]="!task.isCompleted">
                {{ task.isCompleted ? 'Completed' : 'Active' }}
              </span>
            </div>
          </div>
        </div>
        @if (task.description) {
          <p class="task-description">{{ task.description }}</p>
        }
        @if (task.tags && task.tags.length > 0) {
          <div class="task-tags-row">
            @for (tag of task.tags; track $index) {
              <span class="task-tag-badge">{{ tag }}</span>
            }
          </div>
        }
        <div class="task-meta-row">
          @if (task.dueDate) {
            <span class="task-due-date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ task.dueDate | date : 'MMM d' }}
            </span>
          }
          @if (task.energyLevel) {
            <span class="task-energy" [class.energy-high]="task.energyLevel === 'high'" [class.energy-medium]="task.energyLevel === 'medium'" [class.energy-low]="task.energyLevel === 'low'">
              @if (task.energyLevel === 'high') {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              } @else if (task.energyLevel === 'medium') {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              } @else {
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v20M6 5h5.5a3.5 3.5 0 0 1 0 7H6M18 12h-5.5a3.5 3.5 0 0 1 0-7H18"></path>
                </svg>
              }
              <span>{{ task.energyLevel | titlecase }}</span>
            </span>
          }
        </div>
        <div class="task-actions">
          <button type="button" class="task-action-btn task-action-edit" (click)="onEdit()" [attr.aria-label]="'Edit task ' + task.title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>
          <button type="button" class="task-action-btn task-action-delete" (click)="onDelete()" [attr.aria-label]="'Delete task ' + task.title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </flow-card>
  `,
  styles: [
    `
      .task-card {
        transition: all var(--transition-fast);
        border: 1px solid var(--color-border);
        position: relative;
        overflow: hidden;
        height: 100%;
        min-height: 140px;
        display: flex;
        flex-direction: column;
      }

      .task-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background-color: var(--color-border);
        transition: background-color var(--transition-fast);
      }

      .task-card:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
        border-color: var(--color-primary);
      }

      .task-card:hover::before {
        background-color: var(--color-primary);
      }

      .task-card.completed {
        opacity: 0.7;
      }

      .task-card.completed::before {
        background-color: var(--color-success);
      }

      .task-card-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        padding: var(--space-sm);
        height: 100%;
      }

      .task-header-row {
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm);
      }

      .task-toggle {
        position: relative;
        width: 40px;
        height: 20px;
        background-color: var(--color-border);
        border: none;
        border-radius: var(--radius-full);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        flex-shrink: 0;
        margin-top: 2px;
        padding: 0;
      }

      .task-toggle.completed {
        background-color: var(--color-success);
      }

      .task-toggle:hover {
        opacity: 0.8;
      }

      .toggle-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background-color: var(--color-surface);
        border-radius: 50%;
        transition: transform var(--transition-fast);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .task-toggle.completed .toggle-slider {
        transform: translateX(20px);
      }

      .task-title-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        min-width: 0;
      }

      .task-title-row {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        flex-wrap: wrap;
        width: 100%;
      }

      .task-title {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
        flex: 1;
        min-width: 0;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .task-title.completed {
        text-decoration: line-through;
        color: var(--color-text-secondary);
      }

      .task-priority-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--space-xs);
        border-radius: var(--radius-xs);
        font-size: var(--font-size-xs);
        font-weight: 500;
        white-space: nowrap;
      }

      .task-priority-badge.priority-high {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
      }

      .task-priority-badge.priority-medium {
        background-color: rgba(251, 191, 36, 0.1);
        color: var(--color-warning);
      }

      .task-status-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--space-xs);
        border-radius: var(--radius-xs);
        font-size: var(--font-size-xs);
        font-weight: 500;
        white-space: nowrap;
      }

      .task-status-badge.completed {
        background-color: rgba(34, 197, 94, 0.1);
        color: var(--color-success);
      }

      .task-status-badge.active {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
      }

      .task-description {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .task-tags-row {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
        margin-top: var(--space-xs);
      }

      .task-tag-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--space-xs);
        background-color: var(--color-muted);
        color: var(--color-text-secondary);
        border-radius: var(--radius-xs);
        font-size: var(--font-size-xs);
        font-weight: 500;
        white-space: nowrap;
      }

      .task-meta-row {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        flex-wrap: wrap;
        margin-top: auto;
        padding-top: var(--space-xs);
        border-top: 1px solid var(--color-border);
      }

      .task-due-date {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        padding: 2px var(--space-xs);
        background-color: var(--color-surface);
        border-radius: var(--radius-xs);
      }

      .task-due-date svg {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
      }

      .task-energy {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: var(--font-size-xs);
        font-weight: 500;
        padding: 2px var(--space-xs);
        border-radius: var(--radius-xs);
      }

      .task-energy svg {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
      }

      .task-energy.energy-high {
        background-color: rgba(34, 197, 94, 0.1);
        color: var(--color-success);
      }

      .task-energy.energy-medium {
        background-color: rgba(251, 191, 36, 0.1);
        color: var(--color-warning);
      }

      .task-energy.energy-low {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
      }

      .task-actions {
        display: flex;
        gap: var(--space-xs);
        justify-content: flex-end;
        margin-top: var(--space-xs);
        padding-top: var(--space-xs);
        border-top: 1px solid var(--color-border);
      }

      .task-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: var(--space-xs) var(--space-sm);
        border: none;
        border-radius: var(--radius-xs);
        font-size: var(--font-size-xs);
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
        background: transparent;
      }

      .task-action-btn svg {
        flex-shrink: 0;
      }

      .task-action-edit {
        color: var(--color-warning);
      }

      .task-action-edit:hover {
        background-color: rgba(255, 149, 0, 0.1);
        color: var(--color-warning-dark);
      }

      .task-action-delete {
        color: var(--color-error);
      }

      .task-action-delete:hover {
        background-color: rgba(255, 59, 48, 0.1);
        color: var(--color-error-dark);
      }
    `,
  ],
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() toggle = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();

  onToggle() {
    this.toggle.emit(this.task);
  }

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete() {
    this.delete.emit(this.task.id);
  }
}
