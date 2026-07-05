export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCreateDto {
  items: { productId: number; quantity: number }[];
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}
