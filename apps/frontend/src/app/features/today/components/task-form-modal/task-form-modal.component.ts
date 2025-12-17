import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges
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
              @for (tag of tagsArray(); track $index) {
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
        width: 100%;
        height: 100%;
        flex: 1;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .form-group.tags-group {
        gap: var(--space-sm);
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
        gap: var(--space-sm);
        margin-top: var(--space-md);
        align-items: flex-start;
        width: 100%;
      }

      .tags-preview flow-badge {
        display: inline-flex;
        flex-shrink: 0;
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
export class TaskFormModalComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private tasksApi = inject(TasksApiService);

  @Input() task?: Task;
  @Input() set isOpen(value: boolean) {
    const wasOpen = this._isOpen();
    this._isOpen.set(value);
    
    if (value && !wasOpen) {
      // Modal is opening
      if (this.task) {
        // Populate form when modal opens with a task
        setTimeout(() => this.populateForm(), 0);
      } else {
        // Reset form when modal opens without a task (new task)
        setTimeout(() => this.resetForm(), 0);
      }
    }
  }
  protected _isOpen = signal(false);
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Task>();

  taskForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  tagsArray = signal<string[]>([]);
  
  private createMutation = this.tasksApi.createTask();
  private updateMutation = this.tasksApi.updateTask();

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

    // Watch for modal opening/closing and task changes
    effect(() => {
      const isOpen = this._isOpen();
      const currentTask = this.task;
      
      if (isOpen) {
        // Modal is opening - populate or reset form
        if (currentTask) {
          // Use setTimeout to ensure form is ready
          setTimeout(() => this.populateForm(), 0);
        } else {
          setTimeout(() => this.resetForm(), 0);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When task changes while modal is open, update the form
    if (changes['task'] && this._isOpen()) {
      if (this.task) {
        setTimeout(() => this.populateForm(), 0);
      } else {
        setTimeout(() => this.resetForm(), 0);
      }
    }
  }

  populateForm() {
    if (!this.task) {
      this.resetForm();
      return;
    }

    // Format dueDate for datetime-local input (YYYY-MM-DDTHH:mm)
    let dueDate = '';
    if (this.task.dueDate) {
      try {
        const date = new Date(this.task.dueDate);
        if (!isNaN(date.getTime())) {
          // Get local date string in format YYYY-MM-DDTHH:mm
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          dueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      } catch (e) {
        console.warn('Error parsing dueDate:', e);
      }
    }

    // Populate all form fields
    this.taskForm.patchValue({
      title: this.task.title || '',
      description: this.task.description || '',
      dueDate: dueDate,
      priority: this.task.priority ?? null,
      energyLevel: this.task.energyLevel ?? null,
      estimatedDuration: this.task.estimatedDuration ?? null,
      tags: this.task.tags && this.task.tags.length > 0 ? this.task.tags.join(', ') : '',
    }, { emitEvent: false });

    // Update tags array
    this.tagsArray.set(this.task.tags || []);
    
    // Clear any previous error messages
    this.errorMessage.set(null);
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
      this.updateMutation.mutate(
        { id: this.task.id, data: taskData },
        {
          onSuccess: (updatedTask) => {
            this.isSubmitting.set(false);
            this.saved.emit(updatedTask);
            this.handleClose();
          },
          onError: (error: unknown) => {
            this.isSubmitting.set(false);
            const errorMessage = error && typeof error === 'object' && 'error' in error
              ? (error.error as { message?: string })?.message || 'Failed to update task. Please try again.'
              : 'Failed to update task. Please try again.';
            this.errorMessage.set(errorMessage);
          },
        }
      );
    } else {
      this.createMutation.mutate(taskData, {
        onSuccess: (newTask) => {
          this.isSubmitting.set(false);
          this.saved.emit(newTask);
          this.handleClose();
        },
        onError: (error: unknown) => {
          this.isSubmitting.set(false);
          const errorMessage = error && typeof error === 'object' && 'error' in error
            ? (error.error as { message?: string })?.message || 'Failed to create task. Please try again.'
            : 'Failed to create task. Please try again.';
          this.errorMessage.set(errorMessage);
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

