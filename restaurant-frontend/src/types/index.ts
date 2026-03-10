export interface ModifierGroup {
  id: string;
  name: string;
  options: string[];
  required: boolean;
  maxSelect: number;
}

export interface Product {
  id: string;
  name: string;
  price: number; // in cents
  modifiers: ModifierGroup[];
  category?: string;
  description?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number; // Unit price in cents
  selectedModifiers?: Record<string, string[]>;
  product?: Pick<Product, 'id' | 'name' | 'price'>; // Lean snapshot — no modifiers
}

export type OrderStatus = "CART" | "ORDER_PLACED" | "ORDER_PAYED" | "ORDER_COMPLETED";

export interface OrderEvent {
  eventId: string;
  timestamp: string;
  orderId: string;
  userId: string;
  type: string;
  source: "web" | "api" | "worker";
  correlationId: string;
  payload: any;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
}

export interface TimelineResponse {
  events: OrderEvent[];
  lastEvaluatedKey?: any;
}
