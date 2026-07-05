import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">⬡</span>
          <span class="brand-text">NEXUS<span class="brand-accent">STORE</span></span>
        </a>

        <div class="nav-links" [class.open]="menuOpen()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Catalog</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/orders" routerLinkActive="active" class="nav-link">Orders</a>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
          }
          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link admin-link">Admin</a>
          }
        </div>

        <div class="nav-actions">
          <a routerLink="/cart" class="cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            @if (cart.totalItems() > 0) {
              <span class="cart-badge">{{ cart.totalItems() }}</span>
            }
          </a>

          @if (auth.isLoggedIn()) {
            <div class="user-menu">
              <div class="user-avatar">{{ auth.currentUser()?.username?.[0]?.toUpperCase() }}</div>
              <div class="dropdown">
                <span class="dropdown-user">{{ auth.currentUser()?.username }}</span>
                <span class="dropdown-role badge badge-violet">{{ auth.currentUser()?.role }}</span>
                <hr class="neon-divider" style="margin:8px 0">
                <button class="dropdown-item" (click)="auth.logout()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-primary" style="padding:8px 18px;font-size:0.7rem">Login</a>
          }

          <button class="hamburger" (click)="menuOpen.update(v => !v)">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      padding: 0 24px;
      transition: all 0.3s ease;
      &.scrolled {
        background: rgba(2, 2, 10, 0.95);
        backdrop-filter: blur(30px);
        border-bottom: 1px solid rgba(124, 58, 237, 0.2);
        box-shadow: 0 4px 30px rgba(0,0,0,0.5);
      }
    }
    .nav-inner {
      max-width: 1400px; margin: 0 auto;
      display: flex; align-items: center; gap: 32px;
      height: 70px;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      .brand-icon { font-size: 1.5rem; color: var(--neon-violet); filter: drop-shadow(0 0 8px var(--neon-violet)); }
      .brand-text { font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 900; letter-spacing: 0.1em; }
      .brand-accent { color: var(--neon-cyan); text-shadow: 0 0 10px rgba(6,182,212,0.6); }
    }
    .nav-links {
      display: flex; align-items: center; gap: 4px; flex: 1;
    }
    .nav-link {
      padding: 6px 14px; border-radius: 6px;
      font-family: 'Orbitron', monospace; font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-mid);
      transition: all 0.2s;
      &:hover, &.active { color: var(--text-bright); background: rgba(124,58,237,0.15); }
      &.active { color: #c4b5fd; }
    }
    .admin-link { color: var(--neon-pink) !important; }
    .nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .cart-btn {
      position: relative; display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 10px;
      background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
      color: var(--text-mid); transition: all 0.2s;
      &:hover { color: var(--neon-violet); box-shadow: var(--glow-violet); background: rgba(124,58,237,0.2); }
    }
    .cart-badge {
      position: absolute; top: -5px; right: -5px;
      background: var(--neon-pink); color: #fff;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 0.6rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 8px rgba(236,72,153,0.6);
    }
    .user-menu {
      position: relative;
      &:hover .dropdown { opacity: 1; pointer-events: all; transform: translateY(0); }
    }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--neon-violet), var(--neon-cyan));
      display: flex; align-items: center; justify-content: center;
      font-family: 'Orbitron', monospace; font-size: 0.8rem; font-weight: 700;
      cursor: pointer; box-shadow: var(--glow-violet);
    }
    .dropdown {
      position: absolute; top: calc(100% + 12px); right: 0;
      background: var(--bg-panel); border: 1px solid var(--border-neon);
      border-radius: 12px; padding: 12px; min-width: 180px;
      backdrop-filter: blur(20px);
      opacity: 0; pointer-events: none; transform: translateY(-8px);
      transition: all 0.2s;
    }
    .dropdown-user { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.95rem; }
    .dropdown-item {
      display: flex; align-items: center; gap: 8px; width: 100%;
      padding: 8px 10px; border-radius: 6px; background: transparent;
      color: var(--text-mid); font-size: 0.85rem; border: none; cursor: pointer;
      transition: all 0.2s; margin-top: 4px;
      &:hover { background: rgba(239,68,68,0.1); color: #f87171; }
    }
    .hamburger {
      display: none; flex-direction: column; gap: 4px; background: none; border: none; padding: 4px;
      span { display: block; width: 22px; height: 2px; background: var(--text-mid); border-radius: 2px; transition: all 0.2s; }
    }
    @media (max-width: 768px) {
      .nav-links { display: none; position: fixed; top: 70px; left: 0; right: 0; flex-direction: column; padding: 16px; background: var(--bg-panel); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-subtle); &.open { display: flex; } }
      .hamburger { display: flex; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  scrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 10); }
}
