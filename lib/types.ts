export type OrderStatus = "new" | "preparing" | "ready" | "served" | "cancelled";
export type ServicePacing = "Together" | "Drinks First" | "Coursed";
export type StaffRole = "staff" | "owner";

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  tax_rate: number;
  default_tip_rate: number;
  currency: string;
  logo_url: string | null;
  accent_color: string | null;
  created_at?: string;
}

export interface Profile {
  id: string;
  restaurant_id: string;
  full_name: string;
  role: StaffRole;
  created_at?: string;
}

export interface DiningTable {
  id: string;
  restaurant_id: string;
  label: string;
  section: string | null;
  qr_slug: string;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  badge: string | null;
  meta: string | null;
  is_signature: boolean;
  is_available: boolean;
  tags: string[] | null;
  sort_order: number;
}

/** MenuItem with its category name inlined — used in admin menu manager */
export interface MenuItemWithCategory extends MenuItem {
  category_name: string | null;
}

/** DiningTable with a pre-generated QR code URL — used in tables manager */
export interface TableWithQR extends DiningTable {
  qr_url: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  order_number: string;
  status: OrderStatus;
  pacing: ServicePacing;
  chef_notes: string | null;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  placed_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  note: string | null;
  image_url: string | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  tables?: Pick<DiningTable, "label" | "section"> | null;
}

/** Filters for the orders history page */
export interface OrderFilters {
  status: OrderStatus | "all";
  dateFrom: string | null;
  dateTo: string | null;
  page: number;
}

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
  imageUrl: string | null;
  description?: string | null;
}

export interface CartState {
  tableId: string;
  lines: CartLine[];
  pacing: ServicePacing;
  chefNotes: string;
  tipRate: number;
}

export interface TableHealthStat {
  name: string;
  total_bytes: number;
  row_count: number;
}

export interface DatabaseHealthData {
  db_bytes: number;
  db_limit_bytes: number;
  storage_bytes: number;
  storage_limit_bytes: number;
  tables: TableHealthStat[];
  recorded_at: string;
  is_fallback?: boolean;
}

