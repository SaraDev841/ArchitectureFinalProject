import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-wrapper">
      <a routerLink="/" class="back-link">← Back to Catalog</a>

      @if (loading()) {
        <div class="detail-skeleton">
          <div class="skeleton" style="height:400px;border-radius:16px"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:16px">
            <div class="skeleton" style="height:40px;width:80%"></div>
            <div class="skeleton" style="height:20px;width:50%"></div>
            <div class="skeleton" style="height:100px"></div>
          </div>
        </div>
      } @else if (product()) {
        <div class="detail-grid">
          <div class="detail-img glass-card">
            <div class="img-placeholder">{{ product()!.name[0] }}</div>
            <div class="img-decorations">
              <div class="corner-tl"></div><div class="corner-br"></div>
            </div>
          </div>

          <div class="detail-content">
            <div class="detail-meta">
              <span class="badge badge-violet">{{ product()!.categoryName }}</span>
              <span class="product-id">ID: #{{product()!.id.toString().padStart(4,'0')}}</span>
            </div>
            <h1 class="detail-title">{{ product()!.name }}</h1>
            <div class="detail-price">
              <span class="price-value neon-text-cyan">{{ product()!.price | currency }}</span>
              <span class="price-label">/ unit</span>
            </div>
            <hr class="neon-divider">
            <p class="detail-desc">{{ product()!.description }}</p>
            <div class="detail-stock" [class.low]="product()!.stock < 5" [class.out]="product()!.stock === 0">
              <span class="stock-dot"></span>
              @if (product()!.stock === 0) { Out of stock }
              @else if (product()!.stock < 5) { Only {{ product()!.stock }} left! }
              @else { {{ product()!.stock }} units available }
            </div>

            @if (product()!.stock > 0) {
              <div class="qty-row">
                <label class="qty-label">QUANTITY</label>
                <div class="qty-control">
                  <button class="qty-btn" (click)="decQty()">-</button>
                  <span class="qty-val">{{ qty }}</span>
                  <button class="qty-btn" (click)="incQty()">+</button>
                </div>
              </div>
              <button class="btn btn-primary add-btn" (click)="addToCart()">
                🛒 Add {{ qty }} to Cart — {{ (product()!.price * qty) | currency }}
              </button>
            } @else {
              <button class="btn btn-ghost add-btn" disabled>Out of Stock</button>
            }

            <div class="detail-info-grid">
              <div class="info-item">
                <span class="info-key">Added</span>
                <span class="info-val">{{ product()!.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">Category</span>
                <span class="info-val">{{ product()!.categoryName }}</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">⬡</div>
          <h3>Product not found</h3>
          <a routerLink="/" class="btn btn-secondary">← Back</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--text-mid); font-size: 0.85rem; display: inline-block; margin-bottom: 32px; transition: color 0.2s; &:hover { color: var(--neon-cyan); } }
    .detail-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
    .detail-img { height: 420px; display: flex; align-items: center; justify-content: center; position: relative; }
    .img-placeholder { font-size: 10rem; font-weight: 900; font-family: 'Orbitron', monospace; color: rgba(124,58,237,0.3); text-shadow: 0 0 40px rgba(124,58,237,0.2); }
    .corner-tl, .corner-br {
      position: absolute; width: 40px; height: 40px;
      border-color: var(--neon-cyan); border-style: solid; border-width: 0;
    }
    .corner-tl { top: 16px; left: 16px; border-top-width: 2px; border-left-width: 2px; }
    .corner-br { bottom: 16px; right: 16px; border-bottom-width: 2px; border-right-width: 2px; }
    .detail-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .product-id { font-family: 'Share Tech Mono', monospace; color: var(--text-dim); font-size: 0.8rem; }
    .detail-title { font-size: 2rem; margin-bottom: 16px; line-height: 1.2; }
    .detail-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 20px; }
    .price-value { font-family: 'Orbitron', monospace; font-size: 2.5rem; font-weight: 700; }
    .price-label { color: var(--text-dim); font-size: 0.9rem; }
    .neon-divider { margin: 20px 0; }
    .detail-desc { color: var(--text-mid); line-height: 1.7; font-size: 1rem; margin-bottom: 20px; }
    .detail-stock {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
      background: rgba(16,185,129,0.1); color: #34d399; margin-bottom: 24px;
      &.low { background: rgba(245,158,11,0.1); color: #fbbf24; }
      &.out { background: rgba(239,68,68,0.1); color: #f87171; }
    }
    .stock-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
    .qty-label { font-family: 'Orbitron', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-dim); }
    .qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .qty-control { display: flex; align-items: center; gap: 0; border: 1px solid var(--border-neon); border-radius: 8px; overflow: hidden; }
    .qty-btn { width: 36px; height: 36px; background: rgba(124,58,237,0.1); color: var(--text-bright); font-size: 1.1rem; transition: background 0.2s; border: none; cursor: pointer; &:hover { background: rgba(124,58,237,0.25); } }
    .qty-val { width: 50px; text-align: center; font-family: 'Orbitron', monospace; font-size: 1rem; background: rgba(0,0,0,0.3); height: 36px; display: flex; align-items: center; justify-content: center; }
    .add-btn { width: 100%; justify-content: center; padding: 16px; font-size: 0.8rem; margin-bottom: 24px; }
    .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 16px; }
    .info-key { display: block; font-size: 0.65rem; font-family: 'Orbitron', monospace; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 4px; }
    .info-val { font-size: 0.9rem; color: var(--text-mid); }
    .empty-state { text-align: center; padding: 80px; }
    .empty-icon { font-size: 5rem; color: var(--neon-violet); opacity: 0.3; margin-bottom: 20px; }
    @media (max-width: 768px) { .detail-grid, .detail-skeleton { grid-template-columns: 1fr; } .detail-img { height: 260px; } }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  qty = 1;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  incQty() { if (this.product() && this.qty < this.product()!.stock) this.qty++; }
  decQty() { if (this.qty > 1) this.qty--; }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.cart.addItem({ productId: p.id, productName: p.name, price: p.price, quantity: this.qty, stock: p.stock, categoryName: p.categoryName });
    this.toast.success(`${p.name} x${this.qty} added to cart`);
  }
}
