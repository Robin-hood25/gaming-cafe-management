export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'owner' | 'admin' | 'staff'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'owner' | 'admin' | 'staff'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'owner' | 'admin' | 'staff'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cafe_settings: {
        Row: {
          id: string
          cafe_name: string
          tagline: string | null
          logo_url: string | null
          address: string
          phone: string
          whatsapp_number: string
          email: string | null
          google_maps_url: string | null
          opening_hours: string
          currency: string
          timezone: string
          tax_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cafe_name?: string
          tagline?: string | null
          logo_url?: string | null
          address?: string
          phone?: string
          whatsapp_number?: string
          email?: string | null
          google_maps_url?: string | null
          opening_hours?: string
          currency?: string
          timezone?: string
          tax_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cafe_name?: string
          tagline?: string | null
          logo_url?: string | null
          address?: string
          phone?: string
          whatsapp_number?: string
          email?: string | null
          google_maps_url?: string | null
          opening_hours?: string
          currency?: string
          timezone?: string
          tax_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      screens: {
        Row: {
          id: string
          screen_name: string
          screen_type: string
          specs: string | null
          hourly_rate: number
          is_active: boolean
          maintenance_status: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          screen_name: string
          screen_type?: string
          specs?: string | null
          hourly_rate?: number
          is_active?: boolean
          maintenance_status?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          screen_name?: string
          screen_type?: string
          specs?: string | null
          hourly_rate?: number
          is_active?: boolean
          maintenance_status?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          normalized_phone: string
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          normalized_phone: string
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          normalized_phone?: string
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          screen_type: string | null
          screen_id: string | null
          hourly_rate: number
          minimum_duration: number
          billing_interval: number
          rounding_rule: 'ceil' | 'floor' | 'round' | 'exact'
          minimum_session_charge: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          screen_type?: string | null
          screen_id?: string | null
          hourly_rate: number
          minimum_duration?: number
          billing_interval?: number
          rounding_rule?: 'ceil' | 'floor' | 'round' | 'exact'
          minimum_session_charge?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          screen_type?: string | null
          screen_id?: string | null
          hourly_rate?: number
          minimum_duration?: number
          billing_interval?: number
          rounding_rule?: 'ceil' | 'floor' | 'round' | 'exact'
          minimum_session_charge?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          customer_id: string
          screen_id: string
          start_at: string
          original_end_at: string
          current_end_at: string
          actual_end_at: string | null
          original_duration_minutes: number
          session_status: 'active' | 'completed' | 'cancelled'
          player_count: number
          price_snapshot: Json
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          screen_id: string
          start_at?: string
          original_end_at: string
          current_end_at: string
          actual_end_at?: string | null
          original_duration_minutes: number
          session_status?: 'active' | 'completed' | 'cancelled'
          player_count?: number
          price_snapshot?: Json
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          screen_id?: string
          start_at?: string
          original_end_at?: string
          current_end_at?: string
          actual_end_at?: string | null
          original_duration_minutes?: number
          session_status?: 'active' | 'completed' | 'cancelled'
          player_count?: number
          price_snapshot?: Json
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_extensions: {
        Row: {
          id: string
          session_id: string
          additional_minutes: number
          previous_end_at: string
          new_end_at: string
          additional_charge: number
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          additional_minutes: number
          previous_end_at: string
          new_end_at: string
          additional_charge?: number
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          additional_minutes?: number
          previous_end_at?: string
          new_end_at?: string
          additional_charge?: number
          created_by?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          product_name: string
          category: 'Cold Drinks' | 'Snacks' | 'Fast Food' | 'Other'
          selling_price: number
          stock_quantity: number | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_name: string
          category: 'Cold Drinks' | 'Snacks' | 'Fast Food' | 'Other'
          selling_price: number
          stock_quantity?: number | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          category?: 'Cold Drinks' | 'Snacks' | 'Fast Food' | 'Other'
          selling_price?: number
          stock_quantity?: number | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          session_id: string
          customer_id: string
          status: 'draft' | 'confirmed' | 'cancelled'
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          customer_id: string
          status?: 'draft' | 'confirmed' | 'cancelled'
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          customer_id?: string
          status?: 'draft' | 'confirmed' | 'cancelled'
          created_by?: string | null
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          unit_price_snapshot: number
          quantity: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          unit_price_snapshot: number
          quantity: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          unit_price_snapshot?: number
          quantity?: number
          subtotal?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          session_id: string
          customer_id: string
          gaming_amount: number
          snacks_amount: number
          subtotal: number
          discount: number
          tax: number
          total_amount: number
          payment_status: 'unpaid' | 'partially_paid' | 'paid'
          notes: string | null
          created_at: string
          finalized_at: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          session_id: string
          customer_id: string
          gaming_amount?: number
          snacks_amount?: number
          subtotal?: number
          discount?: number
          tax?: number
          total_amount?: number
          payment_status?: 'unpaid' | 'partially_paid' | 'paid'
          notes?: string | null
          created_at?: string
          finalized_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          session_id?: string
          customer_id?: string
          gaming_amount?: number
          snacks_amount?: number
          subtotal?: number
          discount?: number
          tax?: number
          total_amount?: number
          payment_status?: 'unpaid' | 'partially_paid' | 'paid'
          notes?: string | null
          created_at?: string
          finalized_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: 'Cash' | 'UPI' | 'Card' | 'Other'
          payment_reference: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: 'Cash' | 'UPI' | 'Card' | 'Other'
          payment_reference?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: 'Cash' | 'UPI' | 'Card' | 'Other'
          payment_reference?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      get_public_screen_availability: {
        Args: Record<string, never>
        Returns: {
          screen_id: string
          screen_name: string
          screen_type: string
          specs: string | null
          hourly_rate: number
          maintenance_status: boolean
          is_active: boolean
          status: 'AVAILABLE' | 'OCCUPIED' | 'TIME_OVER' | 'MAINTENANCE' | 'INACTIVE'
          current_end_at: string | null
          remaining_seconds: number
          sort_order: number
        }[]
      }
      start_session_atomic: {
        Args: {
          p_customer_name: string
          p_normalized_phone: string
          p_screen_id: string
          p_duration_minutes: number
          p_player_count?: number
          p_notes?: string
          p_created_by?: string
        }
        Returns: Json
      }
      extend_session_atomic: {
        Args: {
          p_session_id: string
          p_additional_minutes: number
          p_created_by?: string
        }
        Returns: Json
      }
      checkout_session_atomic: {
        Args: {
          p_session_id: string
          p_discount?: number
          p_notes?: string
          p_created_by?: string
        }
        Returns: Json
      }
      record_payment_atomic: {
        Args: {
          p_invoice_id: string
          p_amount: number
          p_payment_method: string
          p_payment_reference?: string
          p_recorded_by?: string
        }
        Returns: Json
      }
    }
  }
}

