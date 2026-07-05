import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card animate-slide-up">
        <div class="auth-header">
          <div class="auth-logo">⬡</div>
          <h1>CREATE<span class="neon-text-cyan"> ACCOUNT</span></h1>
          <p>Join the NexusStore network</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label>Username</label>
            <input type="text" class="form-control" formControlName="username" placeholder="Choose username" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="your@email.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="Min 6 characters" />
          </div>

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading()">
            @if (loading()) { <span class="spinner-sm"></span> Creating... }
            @else { → Create Account }
          </button>
        </form>

        <p class="auth-footer">
          Have an account? <a routerLink="/login" class="auth-link">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; z-index: 1; }
    .auth-card { width: 100%; max-width: 420px; padding: 48px 40px; }
    .auth-header { text-align: center; margin-bottom: 36px; }
    .auth-logo { font-size: 3rem; color: var(--neon-violet); filter: drop-shadow(0 0 15px var(--neon-violet)); margin-bottom: 12px; }
    h1 { font-size: 1.2rem; margin-bottom: 8px; }
    p { color: var(--text-mid); font-size: 0.9rem; }
    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    .w-full { width: 100%; justify-content: center; padding: 14px; font-size: 0.8rem; }
    .auth-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; border-radius: 8px; padding: 12px 16px; font-size: 0.85rem; }
    .auth-footer { text-align: center; margin-top: 24px; color: var(--text-mid); font-size: 0.9rem; }
    .auth-link { color: var(--neon-cyan); font-weight: 600; &:hover { text-decoration: underline; } }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form.value as any).subscribe({
      next: () => { this.toast.success('Account created! Please login.'); this.router.navigate(['/login']); },
      error: (e) => { this.error.set(e.error?.message ?? 'Registration failed'); this.loading.set(false); }
    });
  }
}
