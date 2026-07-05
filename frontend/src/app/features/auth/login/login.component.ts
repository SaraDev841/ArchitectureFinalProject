import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>
      <div class="auth-card glass-card animate-slide-up">
        <div class="auth-header">
          <div class="auth-logo">⬡</div>
          <h1>NEXUS<span class="neon-text-cyan">STORE</span></h1>
          <p>Access your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" type="text" class="form-control" formControlName="username" placeholder="Enter username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" class="form-control" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
          </div>

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">
            @if (loading()) { <span class="spinner-sm"></span> Connecting... }
            @else { → Login }
          </button>
        </form>

        <p class="auth-footer">
          No account? <a routerLink="/register" class="auth-link">Register now</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px; position: relative; z-index: 1;
    }
    .auth-bg {
      position: fixed; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(124,58,237,0.12), transparent);
    }
    .auth-card {
      width: 100%; max-width: 420px; padding: 48px 40px; position: relative; z-index: 1;
    }
    .auth-header { text-align: center; margin-bottom: 36px; }
    .auth-logo { font-size: 3rem; color: var(--neon-violet); filter: drop-shadow(0 0 15px var(--neon-violet)); margin-bottom: 12px; }
    h1 { font-size: 1.3rem; margin-bottom: 8px; }
    p { color: var(--text-mid); font-size: 0.9rem; }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .w-full { width: 100%; justify-content: center; padding: 14px; font-size: 0.8rem; }
    .auth-error {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
      color: #f87171; border-radius: 8px; padding: 12px 16px; font-size: 0.85rem;
    }
    .auth-footer { text-align: center; margin-top: 24px; color: var(--text-mid); font-size: 0.9rem; }
    .auth-link { color: var(--neon-cyan); font-weight: 600; &:hover { text-decoration: underline; } }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: () => { this.toast.success('Welcome back!'); this.router.navigate(['/']); },
      error: (e) => { this.error.set(e.error?.message ?? 'Invalid credentials'); this.loading.set(false); }
    });
  }
}
