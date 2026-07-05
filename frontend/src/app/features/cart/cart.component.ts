import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1>SHOPPING <span class="neon-text-cyan">CART</span></h1>
        <a routerLink="/" class="btn btn-ghost">← Continue Shopping</a>
      </div>

      @if (cart.items().length === 0) {
        <div class="empty-cart">
          <div class="empty-icon animate-float">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add items from the catalog to get started</p>
          <a routerLink="/" class="btn btn-primary">→ Browse Catalog</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.items(); track item.productId) {
              <div class="cart-item glass-card animate-slide-up">
                <div class="item-img">{{ item.productName[0] }}</div>
                <div class="item-info">
                  <div class="item-meta">
                    <span class="badge badge-violet">{{ item.categoryName }}</span>
                  </div>
                  <h3 class="item-name">{{ item.productName }}</h3>
                  <span class="item-price neon-text-cyan">{{ item.price | currency }} ea.</span>
                </div>
                <div class="item-actions">
                  <div class="qty-control">
                    <button class="qty-btn" (click)="cart.updateQuantity(item.productId, item.quantity - 1)">-</button>
                    <span class="qty-val">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="cart.updateQuantity(item.productId, item.quantity + 1)" [disabled]="item.quantity >= item.stock">+</button>
                  </div>
                  <span class="item-total">{{ (item.price * item.quantity) | currency }}</span>
                  <button class="remove-btn" (click)="cart.removeItem(item.productId)" title="Remove">✕</button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary glass-card">
            <h2 class="summary-title">ORDER SUMMARY</h2>
            <hr class="neon-divider">
            <div class="summary-rows">
              @for (item of cart.items(); track item.productId) {
                <div class="summary-row">
                  <span>{{ item.productName }} ×{{ item.quantity }}</span>
                  <span>{{ (item.price * item.quantity) | currency }}</span>
                </div>
              }
            </div>
            <hr class="neon-divider">
            <div class="summary-total">
              <span>TOTAL</span>
              <span class="total-val neon-text-cyan">{{ cart.totalPrice() | currency }}</span>
            </div>

            @if (!auth.isLoggedIn()) {
              <div class="summary-notice">
                <a routerLink="/login" class="auth-link">Login</a> to place your order
              </div>
            }

            <button class="btn btn-primary checkout-btn" (click)="checkout()" [disabled]="!auth.isLoggedIn() || placing()">
              @if (placing()) { <span class="spinner-sm"></span> Placing Order... }
              @else { → Place Order }
            </button>
            <button class="btn btn-ghost clear-btn" (click)="cart.clear()">Clear Cart</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.8rem; }
    .empty-cart { text-align: center; padding: 100px 20px; }
    .empty-icon { font-size: 6rem; display: block; margin-bottom: 24px; }
    h2 { font-size: 1.2rem; margin-bottom: 8px; }
    p { color: var(--text-mid); margin-bottom: 24px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .cart-item { display: flex; align-items: center; gap: 16px; padding: 20px; }
    .item-img { width: 70px; height: 70px; border-radius: 10px; background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15)); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 900; font-family: 'Orbitron', monospace; color: rgba(124,58,237,0.5); flex-shrink: 0; }
    .item-info { flex: 1; min-width: 0; }
    .item-meta { margin-bottom: 6px; }
    .item-name { font-size: 0.95rem; font-family: 'Orbitron', monospace; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-price { font-size: 0.85rem; color: var(--text-mid); }
    .item-actions { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .qty-control { display: flex; align-items: center; border: 1px solid var(--border-neon); border-radius: 8px; overflow: hidden; }
    .qty-btn { width: 32px; height: 32px; background: rgba(124,58,237,0.1); color: var(--text-bright); border: none; cursor: pointer; font-size: 1rem; transition: background 0.2s; &:hover { background: rgba(124,58,237,0.25); } &:disabled { opacity: 0.4; } }
    .qty-val { width: 40px; text-align: center; font-family: 'Orbitron', monospace; font-size: 0.9rem; background: rgba(0,0,0,0.3); height: 32px; display: flex; align-items: center; justify-content: center; }
    .item-total { font-family: 'Orbitron', monospace; font-size: 0.9rem; color: #c4b5fd; min-width: 70px; text-align: right; }
    .remove-btn { background: none; border: none; color: var(--text-dim); font-size: 0.9rem; cursor: pointer; transition: color 0.2s; padding: 4px; &:hover { color: #f87171; } }
    .cart-summary { padding: 28px; }
    .summary-title { font-size: 0.85rem; letter-spacing: 0.15em; margin-bottom: 16px; }
    .neon-divider { margin: 12px 0; }
    .summary-rows { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-mid); }
    .summary-total { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 20px; }
    .total-val { font-family: 'Orbitron', monospace; font-size: 1.4rem; font-weight: 700; }
    .summary-notice { font-size: 0.85rem; color: var(--text-mid); text-align: center; margin-bottom: 12px; }
    .auth-link { color: var(--neon-cyan); font-weight: 600; }
    .checkout-btn { width: 100%; justify-content: center; padding: 14px; margin-bottom: 10px; }
    .clear-btn { width: 100%; justify-content: center; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .cart-item { flex-wrap: wrap; } .item-actions { width: 100%; justify-content: space-between; } }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  placing = signal(false);

  checkout() {
    if (!this.auth.isLoggedIn() || this.placing()) return;
    const items = this.cart.items().map(i => ({ productId: i.productId, quantity: i.quantity }));
    this.placing.set(true);
    this.orderService.create({ items }).subscribe({
      next: (order) => {
        this.cart.clear();
        this.toast.success(`Order #${order.id} placed successfully!`);
        this.placing.set(false);
      },
      error: (e) => { this.toast.error(e.error?.message ?? 'Order failed'); this.placing.set(false); }
    });
  }
}
