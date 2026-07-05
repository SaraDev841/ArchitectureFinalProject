import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, UserDashboardDto, CatalogPageDto } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-tag">// USER INTERFACE</div>
          <h1>MISSION <span class="neon-text-violet">CONTROL</span></h1>
        </div>
        <div class="header-right">
          <span class="user-chip">
            <span class="user-avatar-sm">{{ auth.currentUser()?.username?.[0]?.toUpperCase() }}</span>
            {{ auth.currentUser()?.username }}
          </span>
          <span class="badge badge-violet">{{ auth.currentUser()?.role }}</span>
        </div>
      </div>

      <div class="dash-grid">
        <div class="dash-main">
          @if (loadingUser()) {
            <div class="loading-block"><div class="spinner"></div></div>
          } @else if (userDash()) {
            <div class="metrics-row">
              <div class="metric glass-card">
                <div class="metric-icon" style="color:var(--neon-violet)">📦</div>
                <div class="metric-val neon-text-violet">{{ userDash()!.orderCount }}</div>
                <div class="metric-lbl">Total Orders</div>
              </div>
              <div class="metric glass-card">
                <div class="metric-icon" style="color:var(--neon-cyan)">💠</div>
                <div class="metric-val neon-text-cyan">{{ userDash()!.totalSpent | currency }}</div>
                <div class="metric-lbl">Total Spent</div>
              </div>
            </div>

            <div class="section glass-card">
              <h2 class="section-title">RECENT <span class="neon-text-cyan">ORDERS</span></h2>
              <hr class="neon-divider">
              @if (userDash()!.recentOrders.length === 0) {
                <p class="empty-msg">No orders yet. <a routerLink="/" class="link">Start shopping →</a></p>
              } @else {
                @for (order of userDash()!.recentOrders; track order.id) {
                  <div class="order-row">
                    <div>
                      <span class="order-id">#{{ order.id?.toString().padStart(5,'0') }}</span>
                      <span class="order-date">{{ order.createdAt | date:'MMM d, y' }}</span>
                    </div>
                    <div class="order-right">
                      <span class="badge" [class]="getStatusClass(order.status)">{{ order.status }}</span>
                      <span class="order-amt neon-text-cyan">{{ order.totalAmount | currency }}</span>
                    </div>
                  </div>
                }
                <a routerLink="/orders" class="btn btn-secondary view-all-btn">View All Orders →</a>
              }
            </div>
          }
        </div>

        <div class="dash-side">
          <div class="section glass-card">
            <h2 class="section-title">QUICK <span class="neon-text-violet">ACTIONS</span></h2>
            <hr class="neon-divider">
            <div class="quick-actions">
              <a routerLink="/" class="action-btn">🛒 Browse Catalog</a>
              <a routerLink="/cart" class="action-btn">🧺 Open Cart</a>
              <a routerLink="/orders" class="action-btn">📦 My Orders</a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" class="action-btn admin-action">⚙️ Admin Panel</a>
              }
            </div>
          </div>

          @if (catalogPage()) {
            <div class="section glass-card">
              <h2 class="section-title">CATALOG <span class="neon-text-cyan">STATS</span></h2>
              <hr class="neon-divider">
              <div class="catalog-stats">
                <div class="cs-row">
                  <span class="cs-lbl">Total Products</span>
                  <span class="cs-val neon-text-cyan">{{ catalogPage()!.totalProductCount }}</span>
                </div>
                <div class="cs-row">
                  <span class="cs-lbl">Categories</span>
                  <span class="cs-val neon-text-violet">{{ catalogPage()!.categories.length }}</span>
                </div>
                @for (cat of catalogPage()!.categories | slice:0:5; track cat.id) {
                  <div class="cs-row">
                    <span class="cs-lbl">{{ cat.name }}</span>
                    <span class="badge badge-cyan" style="font-size:0.6rem">Active</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-tag { font-family: 'Share Tech Mono', monospace; color: var(--neon-cyan); font-size: 0.75rem; letter-spacing: 0.2em; margin-bottom: 8px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }
    h1 { font-size: 1.8rem; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .user-chip { display: flex; align-items: center; gap: 8px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); padding: 6px 14px; border-radius: 100px; font-size: 0.85rem; }
    .user-avatar-sm { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-violet), var(--neon-cyan)); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-size: 0.65rem; font-weight: 700; }
    .dash-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
    .loading-block { display: flex; justify-content: center; padding: 60px; }
    .metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .metric { padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; }
    .metric-icon { font-size: 1.8rem; }
    .metric-val { font-family: 'Orbitron', monospace; font-size: 1.6rem; font-weight: 700; }
    .metric-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
    .section { padding: 24px; margin-bottom: 20px; }
    .section-title { font-size: 0.85rem; letter-spacing: 0.12em; margin-bottom: 12px; }
    .neon-divider { margin: 12px 0; }
    .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03); gap: 8px; flex-wrap: wrap; }
    .order-id { font-family: 'Orbitron', monospace; font-size: 0.8rem; margin-right: 10px; }
    .order-date { font-size: 0.75rem; color: var(--text-dim); }
    .order-right { display: flex; align-items: center; gap: 12px; }
    .order-amt { font-family: 'Orbitron', monospace; font-size: 0.9rem; }
    .view-all-btn { margin-top: 16px; justify-content: center; }
    .empty-msg { color: var(--text-mid); font-size: 0.9rem; }
    .link { color: var(--neon-cyan); }
    .quick-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
    .action-btn { display: block; padding: 12px 16px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); font-size: 0.9rem; color: var(--text-mid); transition: all 0.2s; &:hover { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.3); color: var(--text-bright); } }
    .admin-action { border-color: rgba(236,72,153,0.3); &:hover { background: rgba(236,72,153,0.1); border-color: rgba(236,72,153,0.5); } }
    .catalog-stats { display: flex; flex-direction: column; gap: 8px; }
    .cs-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; }
    .cs-lbl { font-size: 0.85rem; color: var(--text-mid); }
    .cs-val { font-family: 'Orbitron', monospace; font-size: 0.9rem; font-weight: 600; }
    @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .metrics-row { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private dashService = inject(DashboardService);
  private toast = inject(ToastService);

  userDash = signal<UserDashboardDto | null>(null);
  catalogPage = signal<CatalogPageDto | null>(null);
  loadingUser = signal(true);

  ngOnInit() {
    const userId = this.auth.currentUser()?.userId;
    if (userId) {
      this.dashService.getUserDashboard(userId).subscribe({
        next: d => { this.userDash.set(d); this.loadingUser.set(false); },
        error: () => this.loadingUser.set(false)
      });
    }
    this.dashService.getCatalogPage().subscribe({
      next: d => this.catalogPage.set(d),
      error: () => {}
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { Pending: 'badge-amber', Processing: 'badge-cyan', Shipped: 'badge-violet', Delivered: 'badge-green', Cancelled: 'badge-red' };
    return map[status] ?? 'badge-violet';
  }
}
