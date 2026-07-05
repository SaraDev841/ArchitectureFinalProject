import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>MY <span class="neon-text-violet">ORDERS</span></h1>
        <a routerLink="/" class="btn btn-ghost">← Continue Shopping</a>
      </div>

      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:80px">
          <div class="spinner"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <div class="empty-icon animate-float">📦</div>
          <h2>No orders yet</h2>
          <p>Place your first order from the catalog</p>
          <a routerLink="/" class="btn btn-primary">→ Shop Now</a>
        </div>
      } @else {
        <div class="stats-bar">
          <div class="stat-card glass-card">
            <span class="stat-num neon-text-violet">{{ orders().length }}</span>
            <span class="stat-lbl">Total Orders</span>
          </div>
          <div class="stat-card glass-card">
            <span class="stat-num neon-text-cyan">{{ totalSpent() | currency }}</span>
            <span class="stat-lbl">Total Spent</span>
          </div>
          <div class="stat-card glass-card">
            <span class="stat-num" style="color:#34d399">{{ deliveredCount() }}</span>
            <span class="stat-lbl">Delivered</span>
          </div>
        </div>

        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-card glass-card animate-slide-up" (click)="toggleExpand(order.id)">
              <div class="order-header">
                <div class="order-id-block">
                  <span class="order-num">ORDER #{{ order.id.toString().padStart(5,'0') }}</span>
                  <span class="order-date">{{ order.createdAt | date:'MMM d, y · HH:mm' }}</span>
                </div>
                <div class="order-right">
                  <span class="badge" [class]="getStatusClass(order.status)">{{ order.status }}</span>
                  <span class="order-total neon-text-cyan">{{ order.totalAmount | currency }}</span>
                  <span class="expand-icon" [class.expanded]="expandedId() === order.id">▼</span>
                </div>
              </div>

              @if (expandedId() === order.id) {
                <div class="order-items animate-slide-up">
                  <hr class="neon-divider" style="margin: 16px 0">
                  <table class="data-table">
                    <thead>
                      <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      @for (item of order.orderItems; track item.id) {
                        <tr>
                          <td>{{ item.productName }}</td>
                          <td>{{ item.quantity }}</td>
                          <td>{{ item.unitPrice | currency }}</td>
                          <td class="neon-text-cyan">{{ item.totalPrice | currency }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.8rem; }
    .empty-state { text-align: center; padding: 100px 20px; }
    .empty-icon { font-size: 6rem; display: block; margin-bottom: 24px; }
    h2 { font-size: 1.2rem; margin-bottom: 8px; }
    p { color: var(--text-mid); margin-bottom: 24px; }
    .stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; }
    .stat-num { font-family: 'Orbitron', monospace; font-size: 1.6rem; font-weight: 700; }
    .stat-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
    .orders-list { display: flex; flex-direction: column; gap: 12px; }
    .order-card { padding: 20px 24px; cursor: pointer; transition: box-shadow 0.2s; &:hover { box-shadow: 0 0 20px rgba(124,58,237,0.15); } }
    .order-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .order-id-block { display: flex; flex-direction: column; gap: 4px; }
    .order-num { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 600; }
    .order-date { font-family: 'Share Tech Mono', monospace; font-size: 0.75rem; color: var(--text-dim); }
    .order-right { display: flex; align-items: center; gap: 16px; }
    .order-total { font-family: 'Orbitron', monospace; font-size: 1rem; font-weight: 700; }
    .expand-icon { color: var(--text-dim); transition: transform 0.2s; font-size: 0.7rem; &.expanded { transform: rotate(180deg); } }
    .order-items { margin-top: 4px; }
    @media (max-width: 600px) { .stats-bar { grid-template-columns: 1fr; } .order-right { gap: 8px; } }
  `]
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  expandedId = signal<number | null>(null);
  totalSpent = computed(() => this.orders().reduce((s, o) => s + o.totalAmount, 0));
  deliveredCount = computed(() => this.orders().filter(o => o.status === OrderStatus.Delivered).length);

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => { this.toast.error('Failed to load orders'); this.loading.set(false); }
    });
  }

  toggleExpand(id: number) {
    this.expandedId.update(current => current === id ? null : id);
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<string, string> = {
      [OrderStatus.Pending]: 'badge-amber',
      [OrderStatus.Processing]: 'badge-cyan',
      [OrderStatus.Shipped]: 'badge-violet',
      [OrderStatus.Delivered]: 'badge-green',
      [OrderStatus.Cancelled]: 'badge-red',
    };
    return map[status] ?? 'badge-violet';
  }
}
