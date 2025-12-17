import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

@Component({
  selector: 'flow-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .container {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        padding-left: var(--space-lg);
        padding-right: var(--space-lg);
      }

      .container.size-sm {
        max-width: 640px;
      }

      .container.size-md {
        max-width: 768px;
      }

      .container.size-lg {
        max-width: 1024px;
      }

      .container.size-xl {
        max-width: 1280px;
      }

      .container.size-2xl {
        max-width: 1536px;
      }

      .container.size-full {
        max-width: 100%;
      }

      .container.no-padding {
        padding-left: 0;
        padding-right: 0;
      }

      @media (max-width: 640px) {
        .container {
          padding-left: var(--space-md);
          padding-right: var(--space-md);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'xl';
  @Input() noPadding = false;

  get containerClasses(): string {
    const classes = [
      'container',
      `size-${this.size}`,
      this.noPadding ? 'no-padding' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }
}
