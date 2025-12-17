import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../core/models/types';
import { CreateTaskDto, TasksApiService } from '../../../../core/services/api/tasks-api.service';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { TextareaComponent } from '../../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'flow-task-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  template: `
    <flow-modal
      [title]="task ? 'Edit Task' : 'Create New Task'"
      size="md"
      [isOpen]="_isOpen"
      (closed)="handleClose()">
      <form [formGroup]="taskForm" (ngSubmit)="handleSubmit()" class="task-form">
        <div class="form-group">
          <flow-input
            formControlName="title"
            label="Title"
            placeholder="Enter task title"
            [required]="true"
            [error]="getFieldError('title')" />
        </div>

        <div class="form-group">
          <flow-textarea
            formControlName="description"
            label="Description"
            placeholder="Add a description (optional)"
            [rows]="4" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <flow-input
              formControlName="dueDate"
              type="datetime-local"
              label="Due Date"
              placeholder="Select due date" />
          </div>

          <div class="form-group">
            <label class="form-label">
              Priority
              <select formControlName="priority" class="form-select">
                <option [value]="null">None</option>
                <option [value]="1">High (1)</option>
                <option [value]="2">Medium (2)</option>
                <option [value]="3">Normal (3)</option>
                <option [value]="4">Low (4)</option>
                <option [value]="5">Very Low (5)</option>
              </select>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              Energy Level
              <select formControlName="energyLevel" class="form-select">
                <option [value]="null">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <div class="form-group">
            <flow-input
              formControlName="estimatedDuration"
              type="number"
              label="Estimated Duration (minutes)"
              placeholder="e.g. 30" />
          </div>
        </div>

        <div class="form-group">
          <flow-input
            formControlName="tags"
            label="Tags"
            placeholder="Enter tags separated by commas (e.g. work, urgent)"
            (blur)="handleTagsBlur()" />
          @if (tagsArray().length > 0) {
            <div class="tags-preview">
              @for (tag of tagsArray(); track tag) {
                <flow-badge variant="default" size="sm">{{ tag }}</flow-badge>
              }
            </div>
          }
        </div>

        @if (errorMessage()) {
          <div class="error-message">
            {{ errorMessage() }}
          </div>
        }

        <div class="form-actions" modal-footer>
          <flow-button
            variant="ghost"
            size="md"
            type="button"
            (clicked)="handleClose()">
            Cancel
          </flow-button>
          <flow-button
            variant="solid"
            size="md"
            type="submit"
            [loading]="isSubmitting()"
            [disabled]="taskForm.invalid || isSubmitting()">
            {{ task ? 'Update Task' : 'Create Task' }}
          </flow-button>
        </div>
      </form>
    </flow-modal>
  `,
  styles: [
    `
      .task-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-lg);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-md);
      }

      .form-label {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .form-select {
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
        font-family: var(--font-family);
        background-color: var(--color-surface);
        color: var(--color-text-primary);
        transition: all var(--transition-fast);
      }

      .form-select:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(20, 168, 0, 0.1);
      }

      .tags-preview {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        margin-top: var(--space-xs);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        margin-top: var(--space-md);
      }

      .error-message {
        padding: var(--space-sm) var(--space-md);
        background-color: rgba(255, 59, 48, 0.1);
        border: 1px solid var(--color-error);
        border-radius: var(--radius-md);
        color: var(--color-error);
        font-size: var(--font-size-sm);
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TaskFormModalComponent {
  private fb = inject(FormBuilder);
  private tasksApi = inject(TasksApiService);

  @Input() task?: Task;
  @Input() set isOpen(value: boolean) {
    this._isOpen.set(value);
  }
  protected _isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Task>();

  taskForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  tagsArray = signal<string[]>([]);

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priority: [null],
      energyLevel: [null],
      estimatedDuration: [null],
      tags: [''],
    });

    this.taskForm.get('tags')?.valueChanges.subscribe((value) => {
      if (value) {
        const tags = value
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0);
        this.tagsArray.set(tags);
      } else {
        this.tagsArray.set([]);
      }
    });

    effect(() => {
      if (this._isOpen()) {
        if (this.task) {
          this.populateForm();
        } else {
          this.resetForm();
        }
      }
    });
  }

  populateForm() {
    if (!this.task) return;

    const dueDate = this.task.dueDate
      ? new Date(this.task.dueDate).toISOString().slice(0, 16)
      : '';

    this.taskForm.patchValue({
      title: this.task.title,
      description: this.task.description || '',
      dueDate: dueDate,
      priority: this.task.priority || null,
      energyLevel: this.task.energyLevel || null,
      estimatedDuration: this.task.estimatedDuration || null,
      tags: this.task.tags?.join(', ') || '',
    });

    this.tagsArray.set(this.task.tags || []);
  }

  resetForm() {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDate: '',
      priority: null,
      energyLevel: null,
      estimatedDuration: null,
      tags: '',
    });
    this.tagsArray.set([]);
    this.errorMessage.set(null);
  }

  handleTagsBlur() {
    const tagsValue = this.taskForm.get('tags')?.value || '';
    const tags = tagsValue
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);
    this.taskForm.patchValue({ tags: tags.join(', ') }, { emitEvent: false });
    this.tagsArray.set(tags);
  }

  getFieldError(fieldName: string): string | undefined {
    const field = this.taskForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} is too short`;
      }
    }
    return undefined;
  }

  handleSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.taskForm.value;
    const taskData: CreateTaskDto = {
      title: formValue.title,
      description: formValue.description || undefined,
      dueDate: formValue.dueDate
        ? new Date(formValue.dueDate).toISOString()
        : undefined,
      priority: formValue.priority !== null && formValue.priority !== undefined
        ? parseInt(formValue.priority, 10)
        : undefined,
      energyLevel: formValue.energyLevel || undefined,
      estimatedDuration: formValue.estimatedDuration !== null && formValue.estimatedDuration !== undefined
        ? parseInt(formValue.estimatedDuration, 10)
        : undefined,
      tags: this.tagsArray().length > 0 ? this.tagsArray() : undefined,
    };

    if (this.task) {
      const updateMutation = this.tasksApi.updateTask();
      updateMutation.mutate(
        { id: this.task.id, data: taskData },
        {
          onSuccess: (updatedTask) => {
            this.isSubmitting.set(false);
            this.saved.emit(updatedTask);
            this.handleClose();
          },
          onError: (error: any) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(
              error?.error?.message || 'Failed to update task. Please try again.'
            );
          },
        }
      );
    } else {
      const createMutation = this.tasksApi.createTask();
      createMutation.mutate(taskData, {
        onSuccess: (newTask) => {
          this.isSubmitting.set(false);
          this.saved.emit(newTask);
          this.handleClose();
        },
        onError: (error: any) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            error?.error?.message || 'Failed to create task. Please try again.'
          );
        },
      });
    }
  }

  handleClose() {
    this._isOpen.set(false);
    this.resetForm();
    this.closed.emit();
  }
}

