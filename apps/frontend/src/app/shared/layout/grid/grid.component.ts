import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

@Component({
  selector: 'flow-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="gridClasses" [style.gap]="gap">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        width: 100%;
      }

      .grid.cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }

      .grid.cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .grid.cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .grid.cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .grid.cols-6 {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }

      .grid.cols-12 {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }

      @media (max-width: 768px) {
        .grid.cols-2,
        .grid.cols-3,
        .grid.cols-4,
        .grid.cols-6 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }

      @media (min-width: 769px) and (max-width: 1024px) {
        .grid.cols-3,
        .grid.cols-4,
        .grid.cols-6 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  @Input() cols: 1 | 2 | 3 | 4 | 6 | 12 = 1;
  @Input() gap?: string;

  get gridClasses(): string {
    return `grid cols-${this.cols}`;
  }
}
