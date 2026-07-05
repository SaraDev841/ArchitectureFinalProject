import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </span>
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-icon { font-size: 1.1rem; flex-shrink: 0; }
    .toast { cursor: pointer; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
