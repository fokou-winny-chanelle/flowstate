import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated';

@Component({
  selector: 'fs-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses" (click)="handleClick($event)">
      @if (header) {
        <div class="card-header">
          <ng-content select="[header]"></ng-content>
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (footer) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() clickable = false;
  @Input() header = false;
  @Input() footer = false;
  @Input() noPadding = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get cardClasses(): string {
    return [
      'fs-card',
      `variant-${this.variant}`,
      this.clickable ? 'clickable' : '',
      this.noPadding ? 'no-padding' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (this.clickable) {
      this.clicked.emit(event);
    }
  }
}

