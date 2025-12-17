import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'flow-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="clickable ? '/' : null"
      [class]="logoClasses"
      [attr.aria-label]="clickable ? 'Go to home' : 'FlowState logo'"
      (click)="handleClick($event)">
      <img
        [src]="logoSrc"
        [alt]="'FlowState logo'"
        [class]="imageClasses"
        loading="eager"
        decoding="async"
        fetchpriority="high" />
    </a>
  `,
  styles: [
    `
      .logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: opacity var(--transition-fast);
        width: 100%;
      }

      .logo.clickable {
        cursor: pointer;
      }

      .logo.clickable:hover {
        opacity: 0.8;
      }

      .logo.clickable:active {
        opacity: 0.7;
        transform: scale(0.98);
      }

      .logo-image {
        display: block;
        height: auto;
        width: auto;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        image-rendering: high-quality;
        object-fit: contain;
      }

      .logo.size-xs .logo-image {
        height: 40px;
        width: auto;
        min-width: auto;
      }

      .logo.size-sm .logo-image {
        height: 56px;
        width: auto;
        min-width: auto;
      }

      .logo.size-md .logo-image {
        height: 80px;
        width: auto;
        min-width: auto;
      }

      .logo.size-lg .logo-image {
        height: 120px;
        width: auto;
        min-width: auto;
      }

      .logo.size-xl .logo-image {
        height: 160px;
        width: auto;
        min-width: auto;
      }

      .logo.size-2xl .logo-image {
        height: 220px;
        width: auto;
        min-width: auto;
      }

      .logo.variant-white .logo-image {
        filter: brightness(0) invert(1);
      }

      .logo.variant-dark .logo-image {
        filter: brightness(0);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() variant: 'default' | 'white' | 'dark' = 'default';
  @Input() clickable = true;

  get logoSrc(): string {
    if (this.size === 'xs' || this.size === 'sm') {
      return '/logo-small.png';
    }
    return '/logo.png';
  }

  get logoClasses(): string {
    const classes = [
      'logo',
      `size-${this.size}`,
      `variant-${this.variant}`,
      this.clickable ? 'clickable' : '',
    ];
    return classes.filter((c) => c).join(' ');
  }

  get imageClasses(): string {
    return 'logo-image';
  }

  handleClick(event: MouseEvent) {
    if (!this.clickable) {
      event.preventDefault();
    }
  }
}
