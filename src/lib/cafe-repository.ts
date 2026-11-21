import { 
  Screen, Customer, Session, SessionExtension, Product, Order, OrderItem, 
  PricingRule, Invoice, Payment, AuditLog, CafeSettings, PublicScreenAvailability,
  ActiveSessionView
} from '@/types/cafe';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { localDb } from '@/lib/local-db';

export class CafeRepository {
  private static instance: CafeRepository;

  public static getInstance(): CafeRepository {
    if (!CafeRepository.instance) {
      CafeRepository.instance = new CafeRepository();
    }
    return CafeRepository.instance;
  }

  public isUsingSupabase(): boolean {
    return isSupabaseConfigured();
  }

  // ------------------------------------------------------------------
  // REALTIME SUBSCRIPTION
  // ------------------------------------------------------------------
  public subscribeToAvailability(callback: () => void) {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const channel = supabase
          .channel('public:availability_channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'screens' },
            () => callback()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sessions' },
            () => callback()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'session_extensions' },
            () => callback()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }

    // Local DB subscription
    return localDb.subscribe(callback);
  }

  // ------------------------------------------------------------------
  // 1. PUBLIC SCREEN AVAILABILITY (SANITIZED)
  // ------------------------------------------------------------------
  public async getPublicScreenAvailability(): Promise<PublicScreenAvailability[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any).rpc('get_public_screen_availability');
          if (!error && data) {
            return data as PublicScreenAvailability[];
          }
          console.warn('Supabase RPC get_public_screen_availability returned error, falling back:', error);
        } catch (err) {
          console.error('Supabase query failed:', err);
        }
      }
    }

    return localDb.getPublicScreens();
  }

  // ------------------------------------------------------------------
  // 2. CAFE SETTINGS
  // ------------------------------------------------------------------
  public async getCafeSettings(): Promise<CafeSettings> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await supabase.from('cafe_settings').select('*').limit(1).single();
          if (!error && data) {
            return data as CafeSettings;
          }
        } catch (e) {
          console.warn('Failed to load cafe settings from Supabase:', e);
        }
      }
    }
    return localDb.getCafeSettings();
  }

  public async updateCafeSettings(updates: Partial<CafeSettings>): Promise<CafeSettings> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any)
            .from('cafe_settings')
            .update(updates)
            .eq('id', updates.id || '')
            .select()
            .single();
          if (!error && data) {
            return data as CafeSettings;
          }
        } catch (e) {
          console.error('Supabase updateCafeSettings error:', e);
        }
      }
    }
    return localDb.updateCafeSettings(updates);
  }

  // ------------------------------------------------------------------
  // 3. SCREENS
  // ------------------------------------------------------------------
  public async getScreens(): Promise<Screen[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any).from('screens').select('*').order('sort_order', { ascending: true });
          if (!error && data) return data as Screen[];
        } catch (e) {
          console.error(e);
        }
      }
    }
    return localDb.getScreens();
  }

  public async createScreen(input: Omit<Screen, 'id' | 'created_at' | 'updated_at'>): Promise<Screen> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).from('screens').insert([input]).select().single();
        if (error) throw new Error(error.message);
        return data as Screen;
      }
    }
    return localDb.createScreen(input);
  }

  public async updateScreen(id: string, updates: Partial<Screen>): Promise<Screen> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).from('screens').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as Screen;
      }
    }
    return localDb.updateScreen(id, updates);
  }

  public async deleteScreen(id: string): Promise<void> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // Verify active sessions first
        const { data: active } = await (supabase as any).from('sessions').select('id').eq('screen_id', id).eq('session_status', 'active');
        if (active && active.length > 0) {
          throw new Error('Cannot delete screen while it has an active session.');
        }
        const { error } = await (supabase as any).from('screens').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return;
      }
    }
    return localDb.deleteScreen(id);
  }

  // ------------------------------------------------------------------
  // 4. ACTIVE SESSIONS
  // ------------------------------------------------------------------
  public async getActiveSessions(): Promise<ActiveSessionView[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any)
            .from('sessions')
            .select(`
              *,
              customers(id, full_name, normalized_phone),
              screens(id, screen_name, screen_type, hourly_rate)
            `)
            .eq('session_status', 'active')
            .order('start_at', { ascending: false });

          if (!error && data) {
            const now = Date.now();
            return data.map((s: any) => {
              const endTime = new Date(s.current_end_at).getTime();
              const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
              return {
                id: s.id,
                customer_id: s.customer_id,
                customer_name: s.customers?.full_name || 'Customer',
                customer_phone: s.customers?.normalized_phone || '--',
                screen_id: s.screen_id,
                screen_name: s.screens?.screen_name || 'Screen',
                screen_type: s.screens?.screen_type || 'PS5',
                start_at: s.start_at,
                original_end_at: s.original_end_at,
                current_end_at: s.current_end_at,
                actual_end_at: s.actual_end_at,
                original_duration_minutes: s.original_duration_minutes,
                session_status: s.session_status,
                player_count: s.player_count,
                hourly_rate: s.price_snapshot?.hourly_rate || s.screens?.hourly_rate || 120,
                remaining_seconds: remaining,
                is_overdue: endTime <= now,
                orders_total: 0,
                extensions_count: 0,
                notes: s.notes,
              };
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return localDb.getActiveSessions();
  }

  // ------------------------------------------------------------------
  // 5. ATOMIC START SESSION
  // ------------------------------------------------------------------
  public async startSession(params: {
    customerName: string;
    phone: string;
    screenId: string;
    durationMinutes: number;
    playerCount?: number;
    notes?: string;
    createdBy?: string;
  }) {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).rpc('start_session_atomic', {
          p_customer_name: params.customerName,
          p_normalized_phone: params.phone,
          p_screen_id: params.screenId,
          p_duration_minutes: params.durationMinutes,
          p_player_count: params.playerCount || 1,
          p_notes: params.notes,
          p_created_by: params.createdBy,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    }
    return localDb.startSession(params);
  }

  // ------------------------------------------------------------------
  // 6. ATOMIC EXTEND SESSION
  // ------------------------------------------------------------------
  public async extendSession(params: {
    sessionId: string;
    additionalMinutes: number;
    createdBy?: string;
  }) {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).rpc('extend_session_atomic', {
          p_session_id: params.sessionId,
          p_additional_minutes: params.additionalMinutes,
          p_created_by: params.createdBy,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    }
    return localDb.extendSession(params);
  }

  // ------------------------------------------------------------------
  // 7. ATOMIC CHECKOUT & GENERATE BILL
  // ------------------------------------------------------------------
  public async checkoutSession(params: {
    sessionId: string;
    discount?: number;
    notes?: string;
    createdBy?: string;
  }) {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).rpc('checkout_session_atomic', {
          p_session_id: params.sessionId,
          p_discount: params.discount || 0,
          p_notes: params.notes,
          p_created_by: params.createdBy,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    }
    return localDb.checkoutSession(params);
  }

  // ------------------------------------------------------------------
  // 8. PRODUCTS & ORDERS
  // ------------------------------------------------------------------
  public async getProducts(): Promise<Product[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any).from('products').select('*').order('product_name');
          if (!error && data) return data as Product[];
        } catch (e) {
          console.error(e);
        }
      }
    }
    return localDb.getProducts();
  }

  public async createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).from('products').insert([input]).select().single();
        if (error) throw new Error(error.message);
        return data as Product;
      }
    }
    return localDb.createProduct(input);
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).from('products').update(updates).eq('id', id).select().single();
        if (error) throw new Error(error.message);
        return data as Product;
      }
    }
    return localDb.updateProduct(id, updates);
  }

  public async deleteProduct(id: string): Promise<void> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await (supabase as any).from('products').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return;
      }
    }
    return localDb.deleteProduct(id);
  }

  public async addOrderToSession(params: {
    sessionId: string;
    items: Array<{ productId?: string; productName: string; unitPrice: number; quantity: number }>;
    createdBy?: string;
  }) {
    return localDb.addOrderToSession(params);
  }

  public async getSessionOrders(sessionId: string) {
    return localDb.getSessionOrders(sessionId);
  }

  // ------------------------------------------------------------------
  // 9. CUSTOMERS
  // ------------------------------------------------------------------
  public async getCustomers(search?: string): Promise<Customer[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          let query = (supabase as any).from('customers').select('*');
          if (search && search.trim()) {
            query = query.or(`full_name.ilike.%${search}%,normalized_phone.ilike.%${search}%`);
          }
          const { data, error } = await query.order('created_at', { ascending: false });
          if (!error && data) return data as Customer[];
        } catch (e) {
          console.error(e);
        }
      }
    }
    return localDb.getCustomers(search);
  }

  public async getCustomerProfile(id: string) {
    return localDb.getCustomerProfile(id);
  }

  public async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return localDb.updateCustomer(id, updates);
  }

  // ------------------------------------------------------------------
  // 10. PRICING RULES
  // ------------------------------------------------------------------
  public async getPricingRules(): Promise<PricingRule[]> {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          const { data, error } = await (supabase as any).from('pricing_rules').select('*').order('created_at', { ascending: true });
          if (!error && data) return data as PricingRule[];
        } catch (e) {
          console.error(e);
        }
      }
    }
    return localDb.getPricingRules();
  }

  public async savePricingRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<PricingRule> {
    return localDb.savePricingRule(rule);
  }

  public async deletePricingRule(id: string): Promise<void> {
    return localDb.deletePricingRule(id);
  }

  // ------------------------------------------------------------------
  // 11. INVOICES & PAYMENTS
  // ------------------------------------------------------------------
  public async getInvoices() {
    return localDb.getInvoices();
  }

  public async getInvoiceById(id: string) {
    return localDb.getInvoiceById(id);
  }

  public async recordPayment(params: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['payment_method'];
    paymentReference?: string;
    recordedBy?: string;
  }) {
    if (this.isUsingSupabase()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data, error } = await (supabase as any).rpc('record_payment_atomic', {
          p_invoice_id: params.invoiceId,
          p_amount: params.amount,
          p_payment_method: params.paymentMethod,
          p_payment_reference: params.paymentReference,
          p_recorded_by: params.recordedBy,
        });
        if (error) throw new Error(error.message);
        return data;
      }
    }
    return localDb.recordPayment(params);
  }

  // ------------------------------------------------------------------
  // 12. DASHBOARD OVERVIEW & REPORTS
  // ------------------------------------------------------------------
  public async getDashboardOverview() {
    return localDb.getDashboardOverview();
  }

  public async getReports(range: 'today' | 'week' | 'month' | 'all' = 'today') {
    return localDb.getReports(range);
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    return localDb.getAuditLogs();
  }
}

export const cafeRepo = CafeRepository.getInstance();

