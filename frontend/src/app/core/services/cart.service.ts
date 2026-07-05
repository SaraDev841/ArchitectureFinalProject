import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.loadCart());

  totalItems = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  totalPrice = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  addItem(item: CartItem) {
    this.items.update(cart => {
      const existing = cart.find(c => c.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.stock);
        return cart.map(c => c.productId === item.productId ? { ...c, quantity: newQty } : c);
      }
      return [...cart, { ...item, quantity: Math.min(item.quantity, item.stock) }];
    });
    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.removeItem(productId); return; }
    this.items.update(cart => cart.map(c => c.productId === productId ? { ...c, quantity } : c));
    this.saveCart();
  }

  removeItem(productId: number) {
    this.items.update(cart => cart.filter(c => c.productId !== productId));
    this.saveCart();
  }

  clear() {
    this.items.set([]);
    localStorage.removeItem('store_cart');
  }

  private saveCart() {
    localStorage.setItem('store_cart', JSON.stringify(this.items()));
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem('store_cart');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}
