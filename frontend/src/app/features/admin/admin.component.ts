import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

type AdminTab = 'products' | 'categories';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <div>
          <div class="page-tag">// SYSTEM ADMINISTRATION</div>
          <h1>ADMIN <span class="neon-text-pink">PANEL</span></h1>
        </div>
        <div class="header-warning badge badge-amber">⚠ Restricted Access</div>
      </div>

      <div class="admin-tabs">
        <button class="tab" [class.active]="activeTab() === 'products'" (click)="activeTab.set('products')">Products</button>
        <button class="tab" [class.active]="activeTab() === 'categories'" (click)="activeTab.set('categories')">Categories</button>
      </div>

      @if (activeTab() === 'products') {
        <div class="admin-layout">
          <div class="admin-form glass-card">
            <h2 class="form-title">{{ editingProduct() ? 'EDIT' : 'NEW' }} PRODUCT</h2>
            <hr class="neon-divider">
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="admin-form-fields">
              <div class="form-group">
                <label>Name</label>
                <input class="form-control" formControlName="name" placeholder="Product name" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" formControlName="description" placeholder="Description" rows="3" style="resize:vertical"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Price ($)</label>
                  <input class="form-control" type="number" step="0.01" formControlName="price" placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label>Stock</label>
                  <input class="form-control" type="number" formControlName="stock" placeholder="0" />
                </div>
              </div>
              <div class="form-group">
                <label>Category</label>
                <select class="form-control" formControlName="categoryId">
                  <option value="">Select category</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || savingProduct()">
                  @if (savingProduct()) { Saving... } @else { ✓ {{ editingProduct() ? 'Update' : 'Create' }} }
                </button>
                @if (editingProduct()) {
                  <button type="button" class="btn btn-ghost" (click)="cancelEdit()">Cancel</button>
                }
              </div>
            </form>
          </div>

          <div class="admin-list glass-card">
            <div class="list-header">
              <h2 class="form-title">PRODUCTS <span class="badge badge-cyan">{{ products().length }}</span></h2>
              <button class="btn btn-ghost" (click)="loadProducts()">↺ Refresh</button>
            </div>
            <hr class="neon-divider">
            @if (loadingProducts()) {
              <div style="display:flex;justify-content:center;padding:40px"><div class="spinner"></div></div>
            } @else {
              <div class="item-list">
                @for (product of products(); track product.id) {
                  <div class="item-row">
                    <div class="item-info">
                      <span class="item-name">{{ product.name }}</span>
                      <div class="item-meta-row">
                        <span class="badge badge-violet">{{ product.categoryName }}</span>
                        <span class="item-price neon-text-cyan">{{ product.price | currency }}</span>
                        <span class="item-stock">stock: {{ product.stock }}</span>
                      </div>
                    </div>
                    <div class="item-btns">
                      <button class="btn btn-secondary" style="padding:6px 14px;font-size:0.65rem" (click)="editProduct(product)">Edit</button>
                      <button class="btn btn-danger" style="padding:6px 14px;font-size:0.65rem" (click)="deleteProduct(product.id)">Del</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'categories') {
        <div class="admin-layout">
          <div class="admin-form glass-card">
            <h2 class="form-title">{{ editingCategory() ? 'EDIT' : 'NEW' }} CATEGORY</h2>
            <hr class="neon-divider">
            <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="admin-form-fields">
              <div class="form-group">
                <label>Name</label>
                <input class="form-control" formControlName="name" placeholder="Category name" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" formControlName="description" placeholder="Description" rows="3" style="resize:vertical"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="categoryForm.invalid || savingCategory()">
                  @if (savingCategory()) { Saving... } @else { ✓ {{ editingCategory() ? 'Update' : 'Create' }} }
                </button>
                @if (editingCategory()) {
                  <button type="button" class="btn btn-ghost" (click)="cancelCatEdit()">Cancel</button>
                }
              </div>
            </form>
          </div>

          <div class="admin-list glass-card">
            <div class="list-header">
              <h2 class="form-title">CATEGORIES <span class="badge badge-cyan">{{ categories().length }}</span></h2>
              <button class="btn btn-ghost" (click)="loadCategories()">↺ Refresh</button>
            </div>
            <hr class="neon-divider">
            <div class="item-list">
              @for (cat of categories(); track cat.id) {
                <div class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ cat.name }}</span>
                    <span class="item-desc">{{ cat.description }}</span>
                  </div>
                  <div class="item-btns">
                    <button class="btn btn-secondary" style="padding:6px 14px;font-size:0.65rem" (click)="editCategory(cat)">Edit</button>
                    <button class="btn btn-danger" style="padding:6px 14px;font-size:0.65rem" (click)="deleteCategory(cat.id)">Del</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-tag { font-family: 'Share Tech Mono', monospace; color: var(--neon-pink); font-size: 0.75rem; letter-spacing: 0.2em; margin-bottom: 8px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 12px; }
    h1 { font-size: 1.8rem; }
    .neon-text-pink { color: #f9a8d4; text-shadow: 0 0 10px rgba(236,72,153,0.8); }
    .admin-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 10px; width: fit-content; }
    .tab { padding: 8px 24px; border-radius: 8px; font-family: 'Orbitron', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-mid); background: none; border: none; cursor: pointer; transition: all 0.2s; &.active { background: rgba(124,58,237,0.25); color: #c4b5fd; } }
    .admin-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }
    .admin-form { padding: 28px; }
    .form-title { font-size: 0.8rem; letter-spacing: 0.15em; margin-bottom: 12px; }
    .neon-divider { margin: 12px 0 20px; }
    .admin-form-fields { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { display: flex; gap: 10px; }
    .admin-list { padding: 24px; }
    .list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .item-list { display: flex; flex-direction: column; gap: 2px; max-height: 600px; overflow-y: auto; }
    .item-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; transition: background 0.2s; gap: 12px; &:hover { background: rgba(124,58,237,0.05); } }
    .item-info { flex: 1; min-width: 0; }
    .item-name { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .item-price { font-family: 'Orbitron', monospace; font-size: 0.8rem; }
    .item-stock { font-size: 0.75rem; color: var(--text-dim); }
    .item-desc { font-size: 0.8rem; color: var(--text-dim); }
    .item-btns { display: flex; gap: 6px; flex-shrink: 0; }
    @media (max-width: 900px) { .admin-layout { grid-template-columns: 1fr; } }
  `]
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<AdminTab>('products');
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loadingProducts = signal(true);
  savingProduct = signal(false);
  savingCategory = signal(false);
  editingProduct = signal<Product | null>(null);
  editingCategory = signal<Category | null>(null);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required]
  });

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() { this.loadProducts(); this.loadCategories(); }

  loadProducts() {
    this.loadingProducts.set(true);
    this.productService.getAll(1, 100).subscribe({ next: r => { this.products.set(r.items); this.loadingProducts.set(false); }, error: () => this.loadingProducts.set(false) });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({ next: c => this.categories.set(c), error: () => {} });
  }

  editProduct(p: Product) {
    this.editingProduct.set(p);
    this.productForm.patchValue({ name: p.name, description: p.description, price: p.price, stock: p.stock, categoryId: p.categoryId as any });
  }

  cancelEdit() { this.editingProduct.set(null); this.productForm.reset({ price: 0, stock: 0 }); }

  saveProduct() {
    if (this.productForm.invalid) return;
    this.savingProduct.set(true);
    const val = this.productForm.value;
    const dto = { name: val.name!, description: val.description!, price: +val.price!, stock: +val.stock!, categoryId: +val.categoryId! };
    const editing = this.editingProduct();
    const req = editing ? this.productService.update(editing.id, dto) : this.productService.create(dto);
    req.subscribe({
      next: () => { this.toast.success(editing ? 'Product updated' : 'Product created'); this.loadProducts(); this.cancelEdit(); this.savingProduct.set(false); },
      error: (e) => { this.toast.error(e.error?.message ?? 'Failed'); this.savingProduct.set(false); }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({ next: () => { this.toast.success('Product deleted'); this.loadProducts(); }, error: () => this.toast.error('Delete failed') });
  }

  editCategory(c: Category) { this.editingCategory.set(c); this.categoryForm.patchValue({ name: c.name, description: c.description }); }
  cancelCatEdit() { this.editingCategory.set(null); this.categoryForm.reset(); }

  saveCategory() {
    if (this.categoryForm.invalid) return;
    this.savingCategory.set(true);
    const dto = { name: this.categoryForm.value.name!, description: this.categoryForm.value.description! };
    const editing = this.editingCategory();
    const req = editing ? this.categoryService.update(editing.id, dto) : this.categoryService.create(dto);
    req.subscribe({
      next: () => { this.toast.success(editing ? 'Category updated' : 'Category created'); this.loadCategories(); this.cancelCatEdit(); this.savingCategory.set(false); },
      error: (e) => { this.toast.error(e.error?.message ?? 'Failed'); this.savingCategory.set(false); }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Delete this category? Products in it will lose their category.')) return;
    this.categoryService.delete(id).subscribe({ next: () => { this.toast.success('Category deleted'); this.loadCategories(); }, error: () => this.toast.error('Delete failed') });
  }
}
