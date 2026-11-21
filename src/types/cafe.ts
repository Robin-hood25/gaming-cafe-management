import { Database } from './database.types';

export type Screen = Database['public']['Tables']['screens']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionExtension = Database['public']['Tables']['session_extensions']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type PricingRule = Database['public']['Tables']['pricing_rules']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type CafeSettings = Database['public']['Tables']['cafe_settings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type PublicScreenStatus = 'AVAILABLE' | 'OCCUPIED' | 'TIME_OVER' | 'MAINTENANCE' | 'INACTIVE';

export interface PublicScreenAvailability {
  screen_id: string;
  screen_name: string;
  screen_type: string;
  specs: string | null;
  hourly_rate: number;
  maintenance_status: boolean;
  is_active: boolean;
  status: PublicScreenStatus;
  current_end_at: string | null;
  remaining_seconds: number;
  sort_order: number;
}

export interface ActiveSessionView {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  screen_id: string;
  screen_name: string;
  screen_type: string;
  start_at: string;
  original_end_at: string;
  current_end_at: string;
  actual_end_at: string | null;
  original_duration_minutes: number;
  session_status: 'active' | 'completed' | 'cancelled';
  player_count: number;
  hourly_rate: number;
  remaining_seconds: number;
  is_overdue: boolean;
  orders_total: number;
  extensions_count: number;
  notes: string | null;
}

export interface PriceSnapshot {
  hourly_rate: number;
  minimum_duration: number;
  billing_interval: number;
  rounding_rule: 'ceil' | 'floor' | 'round' | 'exact';
  minimum_session_charge?: number;
}

