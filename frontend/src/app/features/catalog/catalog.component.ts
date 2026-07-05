import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, PagedResult } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="hero">
      <div class="hero-content">
        <div class="hero-tag">// DIGITAL MARKETPLACE</div>
        <h1 class="hero-title">
          DISCOVER<br>
          <span class="neon-text-violet">NEXT-GEN</span><br>
          PRODUCTS
        </h1>
        <p class="hero-sub">Explore our curated collection of cutting-edge products</p>
        <div class="hero-actions">
          <button class="btn btn-primary" (click)="scrollToCatalog()">→ Browse Catalog</button>
          <a routerLink="/dashboard" class="btn btn-secondary">View Dashboard</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-val neon-text-cyan">{{ totalCount() }}</span><span class="stat-label">Products</span></div>
          <div class="stat-sep">|</div>
          <div class="stat"><span class="stat-val neon-text-violet">{{ categories().length }}</span><span class="stat-label">Categories</span></div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hex-grid">
          @for (i of hexItems; track i) {
            <div class="hex" [style.animation-delay]="(i * 0.2) + 's'">⬡</div>
          }
        </div>
      </div>
    </div>

    <div class="page-wrapper" id="catalog">
      <div class="catalog-header">
        <h2 class="section-title">PRODUCT <span class="neon-text-cyan">CATALOG</span></h2>
        <div class="catalog-controls">
          <input class="form-control search-input" [(ngModel)]="searchTerm" placeholder="🔍 Search products..." (ngModelChange)="onSearch()" />
          <select class="form-control category-select" [(ngModel)]="selectedCategory" (ngModelChange)="onCategoryChange()">
            <option [ngValue]="null">All Categories</option>
            @for (cat of categories(); track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>
      </div>

      <div class="category-chips">
        <button class="chip" [class.active]="!selectedCategory" (click)="selectCategory(null)">All</button>
        @for (cat of categories(); track cat.id) {
          <button class="chip" [class.active]="selectedCategory === cat.id" (click)="selectCategory(cat.id)">{{ cat.name }}</button>
        }
      </div>

      @if (loading()) {
        <div class="product-grid">
          @for (i of skeletons; track i) {
            <div class="product-card glass-card skeleton-card">
              <div class="skeleton" style="height:180px;border-radius:8px;margin-bottom:16px"></div>
              <div class="skeleton" style="height:20px;width:70%;margin-bottom:8px"></div>
              <div class="skeleton" style="height:16px;width:90%"></div>
            </div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">⬡</div>
          <h3>No products found</h3>
          <p>Try a different search or category</p>
          <button class="btn btn-secondary" (click)="reset()">Reset Filters</button>
        </div>
      } @else {
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <div class="product-card glass-card animate-slide-up" [routerLink]="['/product', product.id]">
              <div class="product-img-wrap">
                <div class="product-img-placeholder">{{ product.name[0] }}</div>
                <div class="product-category-tag badge badge-violet">{{ product.categoryName }}</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.description | slice:0:80 }}{{ product.description.length > 80 ? '...' : '' }}</p>
                <div class="product-footer">
                  <span class="product-price neon-text-cyan">{{ product.price | currency }}</span>
                  <span class="product-stock" [class.low-stock]="product.stock < 5">
                    {{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}
                  </span>
                </div>
                <button class="btn btn-primary add-btn" (click)="addToCart($event, product)" [disabled]="product.stock === 0">
                  + Add to Cart
                </button>
              </div>
            </div>
          }
        </div>

        <div class="pagination">
          <button class="btn btn-ghost" (click)="prevPage()" [disabled]="page() === 1">← Prev</button>
          <span class="page-info">Page {{ page() }} / {{ totalPages() }}</span>
          <button class="btn btn-ghost" (click)="nextPage()" [disabled]="page() >= totalPages()">Next →</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .hero {
      min-height: 100vh; display: flex; align-items: center;
      padding: 80px 24px 60px; max-width: 1400px; margin: 0 auto;
      gap: 60px; position: relative; z-index: 1;
    }
    .hero-content { flex: 1; }
    .hero-tag { font-family: 'Share Tech Mono', monospace; color: var(--neon-cyan); font-size: 0.8rem; letter-spacing: 0.2em; margin-bottom: 20px; }
    .hero-title { font-size: clamp(2.5rem, 6vw, 5rem); line-height: 1.05; margin-bottom: 20px; }
    .hero-sub { color: var(--text-mid); font-size: 1.1rem; margin-bottom: 32px; max-width: 400px; }
    .hero-actions { display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap; }
    .hero-stats { display: flex; align-items: center; gap: 24px; }
    .stat { display: flex; flex-direction: column; }
    .stat-val { font-family: 'Orbitron', monospace; font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }
    .stat-sep { color: var(--border-subtle); font-size: 1.5rem; }
    .hero-visual { flex: 1; display: flex; justify-content: center; }
    .hex-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .hex {
      font-size: 2.5rem; color: var(--neon-violet); opacity: 0.3;
      animation: float 3s ease-in-out infinite;
      &:nth-child(even) { color: var(--neon-cyan); animation-delay: 0.5s; }
      &:nth-child(3n) { color: var(--neon-pink); animation-delay: 1s; }
    }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    .section-title { font-size: 1.4rem; letter-spacing: 0.08em; }
    .catalog-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 20px; flex-wrap: wrap; }
    .catalog-controls { display: flex; gap: 12px; flex: 1; max-width: 500px; }
    .search-input { flex: 1; }
    .category-select { flex: 0 0 180px; }
    .category-chips { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
    .chip {
      padding: 6px 16px; border-radius: 100px; font-size: 0.8rem;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle);
      color: var(--text-mid); cursor: pointer; transition: all 0.2s;
      &.active, &:hover { background: rgba(124,58,237,0.2); border-color: var(--neon-violet); color: #c4b5fd; }
    }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .product-card {
      cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
      &:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(124,58,237,0.2); }
    }
    .skeleton-card { pointer-events: none; padding: 20px; }
    .product-img-wrap { position: relative; margin-bottom: 16px; }
    .product-img-placeholder {
      height: 180px; border-radius: 8px;
      background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1));
      display: flex; align-items: center; justify-content: center;
      font-size: 4rem; font-weight: 900; color: rgba(124,58,237,0.4);
      font-family: 'Orbitron', monospace;
    }
    .product-category-tag { position: absolute; top: 10px; right: 10px; }
    .product-info { padding: 0 16px 16px; }
    .product-name { font-size: 1rem; font-family: 'Orbitron', monospace; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.03em; }
    .product-desc { color: var(--text-mid); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .product-price { font-family: 'Orbitron', monospace; font-size: 1.1rem; font-weight: 700; }
    .product-stock { font-size: 0.75rem; color: var(--neon-green); &.low-stock { color: var(--neon-amber); } }
    .add-btn { width: 100%; justify-content: center; padding: 10px; font-size: 0.72rem; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 20px 0; }
    .page-info { font-family: 'Share Tech Mono', monospace; color: var(--text-mid); font-size: 0.85rem; }
    .empty-state { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 5rem; color: var(--neon-violet); opacity: 0.3; margin-bottom: 20px; }
    h3 { font-size: 1.1rem; margin-bottom: 8px; }
    p { color: var(--text-mid); margin-bottom: 24px; }
    @media (max-width: 960px) { .hero { flex-direction: column; gap: 40px; } .hero-visual { display: none; } }
    @media (max-width: 600px) { .catalog-header { flex-direction: column; align-items: stretch; } .catalog-controls { flex-direction: column; max-width: 100%; } .category-select { flex: unset; } }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  page = signal(1);
  totalCount = signal(0);
  pageSize = 12;
  searchTerm = '';
  selectedCategory: number | null = null;
  hexItems = Array.from({ length: 20 }, (_, i) => i);
  skeletons = Array.from({ length: 8 }, (_, i) => i);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize) || 1);

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll(this.page(), this.pageSize, this.selectedCategory ?? undefined).subscribe({
      next: (result) => { this.products.set(result.items); this.totalCount.set(result.totalCount); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load products'); }
    });
  }

  onSearch() { this.page.set(1); this.loadProducts(); }
  onCategoryChange() { this.page.set(1); this.loadProducts(); }
  selectCategory(id: number | null) { this.selectedCategory = id; this.onCategoryChange(); }
  prevPage() { if (this.page() > 1) { this.page.update(p => p - 1); this.loadProducts(); } }
  nextPage() { if (this.page() < this.totalPages()) { this.page.update(p => p + 1); this.loadProducts(); } }
  reset() { this.selectedCategory = null; this.searchTerm = ''; this.page.set(1); this.loadProducts(); }

  addToCart(event: Event, product: Product) {
    event.preventDefault(); event.stopPropagation();
    this.cart.addItem({ productId: product.id, productName: product.name, price: product.price, quantity: 1, stock: product.stock, categoryName: product.categoryName });
    this.toast.success(`${product.name} added to cart`);
  }

  scrollToCatalog() { document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }
}
