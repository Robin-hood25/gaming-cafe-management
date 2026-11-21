import { 
  Screen, Customer, Session, SessionExtension, Product, Order, OrderItem, 
  PricingRule, Invoice, Payment, AuditLog, CafeSettings, PublicScreenAvailability,
  ActiveSessionView
} from '@/types/cafe';
import { calculateGamingBilling, calculateExtensionCharge } from '@/lib/pricing';
import { normalizePhoneNumber } from '@/lib/utils';

interface LocalDBState {
  cafeSettings: CafeSettings;
  screens: Screen[];
  customers: Customer[];
  pricingRules: PricingRule[];
  sessions: Session[];
  sessionExtensions: SessionExtension[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  invoices: Invoice[];
  payments: Payment[];
  auditLogs: AuditLog[];
}

const STORAGE_KEY = 'nexus_gaming_cafe_db_v1';

const getInitialSeedState = (): LocalDBState => {
  const now = new Date();
  
  const cafeSettings: CafeSettings = {
    id: '00000000-0000-0000-0000-000000000001',
    cafe_name: 'NEXUS GAMING LOUNGE',
    tagline: 'Next-Gen Esports & Console Gaming Lounge',
    logo_url: null,
    address: '#42 Cyber Hub, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 98765 43210',
    whatsapp_number: '+919876543210',
    email: 'contact@nexusgaming.in',
    google_maps_url: 'https://maps.google.com/?q=Nexus+Gaming+Lounge+Indiranagar',
    opening_hours: '11:00 AM – 01:00 AM (All 7 Days)',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    tax_rate: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  const screens: Screen[] = [
    {
      id: '11111111-1111-1111-1111-111111110001',
      screen_name: 'SCREEN 01 (PS5 Pro Station Alpha)',
      screen_type: 'PS5',
      specs: 'Sony PS5 Pro 2TB, 55" LG C3 4K 120Hz OLED, 2x DualSense Edge',
      hourly_rate: 150,
      is_active: true,
      maintenance_status: false,
      sort_order: 1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110002',
      screen_name: 'SCREEN 02 (PS5 Station Beta)',
      screen_type: 'PS5',
      specs: 'Sony PS5 Disc Edition, 55" Sony Bravia 4K 120Hz, 2x DualSense',
      hourly_rate: 120,
      is_active: true,
      maintenance_status: false,
      sort_order: 2,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110003',
      screen_name: 'SCREEN 03 (RTX 4090 Battlestation 1)',
      screen_type: 'PC',
      specs: 'Core i9-14900K, RTX 4090 24GB, 64GB DDR5, 27" 240Hz 1440p Fast-IPS, Logitech G Pro Wireless',
      hourly_rate: 150,
      is_active: true,
      maintenance_status: false,
      sort_order: 3,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110004',
      screen_name: 'SCREEN 04 (RTX 4080 Battlestation 2)',
      screen_type: 'PC',
      specs: 'Core i7-14700K, RTX 4080 16GB, 32GB DDR5, 27" 240Hz 1440p, SteelSeries Apex Pro',
      hourly_rate: 130,
      is_active: true,
      maintenance_status: false,
      sort_order: 4,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110005',
      screen_name: 'SCREEN 05 (Xbox Series X Lounge)',
      screen_type: 'Xbox Series X',
      specs: 'Xbox Series X 1TB, 65" Samsung QLED 4K 120Hz, 2x Xbox Elite Series 2, Game Pass Ultimate',
      hourly_rate: 110,
      is_active: true,
      maintenance_status: false,
      sort_order: 5,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110006',
      screen_name: 'SCREEN 06 (Fanatec Sim Racing Rig)',
      screen_type: 'Racing Sim',
      specs: 'Fanatec ClubSport DD+ 15Nm, V3 Loadcell Pedals, Triple 32" Curved 165Hz, Sparco Bucket Seat',
      hourly_rate: 250,
      is_active: true,
      maintenance_status: false,
      sort_order: 6,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110007',
      screen_name: 'SCREEN 07 (PS5 Casual Station Gamma)',
      screen_type: 'PS5',
      specs: 'Sony PS5 Digital Edition, 50" 4K HDR, 2x DualSense',
      hourly_rate: 100,
      is_active: true,
      maintenance_status: false,
      sort_order: 7,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110008',
      screen_name: 'SCREEN 08 (PC Esports Rig 3)',
      screen_type: 'PC',
      specs: 'Ryzen 7 7800X3D, RTX 4070 Ti Super, 32GB RAM, 24.5" ZOWIE 360Hz DyAc 2',
      hourly_rate: 110,
      is_active: true,
      maintenance_status: false,
      sort_order: 8,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110009',
      screen_name: 'SCREEN 09 (PC Esports Rig 4)',
      screen_type: 'PC',
      specs: 'Ryzen 7 7800X3D, RTX 4070 Ti Super, 32GB RAM, 24.5" ZOWIE 360Hz DyAc 2',
      hourly_rate: 110,
      is_active: true,
      maintenance_status: false,
      sort_order: 9,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '11111111-1111-1111-1111-111111110010',
      screen_name: 'SCREEN 10 (VR Flight & Space Pod)',
      screen_type: 'VR Pod',
      specs: 'Meta Quest 3 + Thrustmaster Warthog HOTAS + Cockpit Rig (Maintenance check)',
      hourly_rate: 300,
      is_active: true,
      maintenance_status: true, // under maintenance for demonstration
      sort_order: 10,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const customers: Customer[] = [
    {
      id: '22222222-2222-2222-2222-222222220001',
      full_name: 'Arjun Sharma',
      normalized_phone: '+919845012345',
      email: 'arjun.sharma@example.com',
      notes: 'Prefers PS5 FIFA & Tekken',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222220002',
      full_name: 'Rohan Patel',
      normalized_phone: '+919876098765',
      email: 'rohan.p@example.com',
      notes: 'Valorant squad captain',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222220003',
      full_name: 'Priya Menon',
      normalized_phone: '+919812345678',
      email: 'priya.menon@example.com',
      notes: 'Sim racing GT3 specialist',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const pricingRules: PricingRule[] = [
    {
      id: '55555555-5555-5555-5555-555555550001',
      screen_type: 'PS5',
      screen_id: null,
      hourly_rate: 120,
      minimum_duration: 30,
      billing_interval: 15,
      rounding_rule: 'ceil',
      minimum_session_charge: 60,
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555550002',
      screen_type: 'PC',
      screen_id: null,
      hourly_rate: 120,
      minimum_duration: 30,
      billing_interval: 15,
      rounding_rule: 'ceil',
      minimum_session_charge: 60,
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555550003',
      screen_type: 'Racing Sim',
      screen_id: null,
      hourly_rate: 250,
      minimum_duration: 30,
      billing_interval: 15,
      rounding_rule: 'ceil',
      minimum_session_charge: 125,
      is_active: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const products: Product[] = [
    {
      id: '66666666-6666-6666-6666-666666660001',
      product_name: 'Red Bull Energy Drink (250ml)',
      category: 'Cold Drinks',
      selling_price: 125,
      stock_quantity: 48,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660002',
      product_name: 'Monster Energy Original (350ml)',
      category: 'Cold Drinks',
      selling_price: 120,
      stock_quantity: 36,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660003',
      product_name: 'Coca-Cola Chill Can (300ml)',
      category: 'Cold Drinks',
      selling_price: 40,
      stock_quantity: 60,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660004',
      product_name: 'Packaged Mineral Water (1L)',
      category: 'Cold Drinks',
      selling_price: 20,
      stock_quantity: 100,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660005',
      product_name: 'Doritos Sweet Chilli (Large)',
      category: 'Snacks',
      selling_price: 50,
      stock_quantity: 50,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660006',
      product_name: 'Peri Peri Cheese Maggi',
      category: 'Fast Food',
      selling_price: 75,
      stock_quantity: 70,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666660007',
      product_name: 'Crispy French Fries (Salted)',
      category: 'Fast Food',
      selling_price: 90,
      stock_quantity: 40,
      is_available: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  // Active session on Screen 02: 90 mins total, started 35 mins ago, 55 mins left
  const startScreen2 = new Date(Date.now() - 35 * 60 * 1000);
  const endScreen2 = new Date(startScreen2.getTime() + 90 * 60 * 1000);

  // Active session on Screen 03: 120 mins total, started 80 mins ago, 40 mins left
  const startScreen3 = new Date(Date.now() - 80 * 60 * 1000);
  const endScreen3 = new Date(startScreen3.getTime() + 120 * 60 * 1000);

  const sessions: Session[] = [
    {
      id: '33333333-3333-3333-3333-333333330001',
      customer_id: '22222222-2222-2222-2222-222222220001',
      screen_id: '11111111-1111-1111-1111-111111110002',
      start_at: startScreen2.toISOString(),
      original_end_at: endScreen2.toISOString(),
      current_end_at: endScreen2.toISOString(),
      actual_end_at: null,
      original_duration_minutes: 90,
      session_status: 'active',
      player_count: 2,
      price_snapshot: { hourly_rate: 120, minimum_duration: 30, billing_interval: 15, rounding_rule: 'ceil' },
      notes: 'EA Sports FC 24 multiplayer friendly',
      created_by: null,
      created_at: startScreen2.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333330002',
      customer_id: '22222222-2222-2222-2222-222222220002',
      screen_id: '11111111-1111-1111-1111-111111110003',
      start_at: startScreen3.toISOString(),
      original_end_at: endScreen3.toISOString(),
      current_end_at: endScreen3.toISOString(),
      actual_end_at: null,
      original_duration_minutes: 120,
      session_status: 'active',
      player_count: 1,
      price_snapshot: { hourly_rate: 150, minimum_duration: 30, billing_interval: 15, rounding_rule: 'ceil' },
      notes: 'Valorant competitive tournament grind',
      created_by: null,
      created_at: startScreen3.toISOString(),
      updated_at: now.toISOString(),
    },
  ];

  const sessionExtensions: SessionExtension[] = [];

  const orders: Order[] = [
    {
      id: '44444444-4444-4444-4444-444444440001',
      session_id: '33333333-3333-3333-3333-333333330001',
      customer_id: '22222222-2222-2222-2222-222222220001',
      status: 'confirmed',
      created_by: null,
      created_at: startScreen2.toISOString(),
    },
  ];

  const orderItems: OrderItem[] = [
    {
      id: '77777777-7777-7777-7777-777777770001',
      order_id: '44444444-4444-4444-4444-444444440001',
      product_id: '66666666-6666-6666-6666-666666660001',
      product_name_snapshot: 'Red Bull Energy Drink (250ml)',
      unit_price_snapshot: 125,
      quantity: 2,
      subtotal: 250,
      created_at: startScreen2.toISOString(),
    },
    {
      id: '77777777-7777-7777-7777-777777770002',
      order_id: '44444444-4444-4444-4444-444444440001',
      product_id: '66666666-6666-6666-6666-666666660006',
      product_name_snapshot: 'Peri Peri Cheese Maggi',
      unit_price_snapshot: 75,
      quantity: 1,
      subtotal: 75,
      created_at: startScreen2.toISOString(),
    },
  ];

  // Completed session & invoice history for demonstration of reports and revenue
  const pastSessionId = '33333333-3333-3333-3333-333333339999';
  const pastInvoiceId = '88888888-8888-8888-8888-888888880001';
  const pastStart = new Date(Date.now() - 4 * 3600 * 1000);
  const pastEnd = new Date(Date.now() - 2 * 3600 * 1000);

  const pastSession: Session = {
    id: pastSessionId,
    customer_id: '22222222-2222-2222-2222-222222220003',
    screen_id: '11111111-1111-1111-1111-111111110006',
    start_at: pastStart.toISOString(),
    original_end_at: pastEnd.toISOString(),
    current_end_at: pastEnd.toISOString(),
    actual_end_at: pastEnd.toISOString(),
    original_duration_minutes: 120,
    session_status: 'completed',
    player_count: 1,
    price_snapshot: { hourly_rate: 250, minimum_duration: 30, billing_interval: 15, rounding_rule: 'ceil' },
    notes: 'Sim racing training session',
    created_by: null,
    created_at: pastStart.toISOString(),
    updated_at: pastEnd.toISOString(),
  };
  sessions.push(pastSession);

  const invoices: Invoice[] = [
    {
      id: pastInvoiceId,
      invoice_number: 'INV-20261121-0001',
      session_id: pastSessionId,
      customer_id: '22222222-2222-2222-2222-222222220003',
      gaming_amount: 500,
      snacks_amount: 140,
      subtotal: 640,
      discount: 40,
      tax: 0,
      total_amount: 600,
      payment_status: 'paid',
      notes: 'Completed checkout with UPI',
      created_at: pastEnd.toISOString(),
      finalized_at: pastEnd.toISOString(),
    },
  ];

  const payments: Payment[] = [
    {
      id: '99999999-9999-9999-9999-999999990001',
      invoice_id: pastInvoiceId,
      amount: 600,
      payment_method: 'UPI',
      payment_reference: 'UPI-NEXUS-883921',
      recorded_by: null,
      created_at: pastEnd.toISOString(),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
      admin_id: null,
      action: 'START_SESSION',
      entity_type: 'sessions',
      entity_id: '33333333-3333-3333-3333-333333330001',
      details: { screen_name: 'SCREEN 02 (PS5 Station Beta)', duration_minutes: 90, customer_name: 'Arjun Sharma' },
      created_at: startScreen2.toISOString(),
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
      admin_id: null,
      action: 'START_SESSION',
      entity_type: 'sessions',
      entity_id: '33333333-3333-3333-3333-333333330002',
      details: { screen_name: 'SCREEN 03 (RTX 4090 Battlestation 1)', duration_minutes: 120, customer_name: 'Rohan Patel' },
      created_at: startScreen3.toISOString(),
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
      admin_id: null,
      action: 'CHECKOUT_SESSION',
      entity_type: 'sessions',
      entity_id: pastSessionId,
      details: { total_amount: 600, invoice_number: 'INV-20261121-0001' },
      created_at: pastEnd.toISOString(),
    },
  ];

  return {
    cafeSettings,
    screens,
    customers,
    pricingRules,
    sessions,
    sessionExtensions,
    products,
    orders,
    orderItems,
    invoices,
    payments,
    auditLogs,
  };
};

class LocalDB {
  private state: LocalDBState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LocalDBState {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load local DB state from storage', e);
      }
    }
    const seed = getInitialSeedState();
    this.saveState(seed);
    return seed;
  }

  private saveState(state = this.state) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to persist local DB state to storage', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener notification error', e);
      }
    });
  }

  // ----------------------------------------------------
  // PUBLIC AVAILABILITY
  // ----------------------------------------------------
  public getPublicScreens(): PublicScreenAvailability[] {
    const now = Date.now();

    return this.state.screens
      .filter((s) => s.is_active)
      .sort((a, b) => a.sort_order - b.sort_order || a.screen_name.localeCompare(b.screen_name))
      .map((screen) => {
        const activeSession = this.state.sessions.find(
          (s) => s.screen_id === screen.id && s.session_status === 'active'
        );

        let status: PublicScreenAvailability['status'] = 'AVAILABLE';
        let currentEndAt: string | null = null;
        let remainingSeconds = 0;

        if (screen.maintenance_status) {
          status = 'MAINTENANCE';
        } else if (activeSession) {
          currentEndAt = activeSession.current_end_at;
          const endTime = new Date(activeSession.current_end_at).getTime();
          remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

          if (remainingSeconds === 0) {
            status = 'TIME_OVER';
          } else {
            status = 'OCCUPIED';
          }
        }

        return {
          screen_id: screen.id,
          screen_name: screen.screen_name,
          screen_type: screen.screen_type,
          specs: screen.specs,
          hourly_rate: screen.hourly_rate,
          maintenance_status: screen.maintenance_status,
          is_active: screen.is_active,
          status,
          current_end_at: currentEndAt,
          remaining_seconds: remainingSeconds,
          sort_order: screen.sort_order,
        };
      });
  }

  // ----------------------------------------------------
  // CAFE SETTINGS
  // ----------------------------------------------------
  public getCafeSettings(): CafeSettings {
    return { ...this.state.cafeSettings };
  }

  public updateCafeSettings(updates: Partial<CafeSettings>): CafeSettings {
    this.state.cafeSettings = {
      ...this.state.cafeSettings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return { ...this.state.cafeSettings };
  }

  // ----------------------------------------------------
  // SCREENS MANAGEMENT
  // ----------------------------------------------------
  public getScreens(): Screen[] {
    return [...this.state.screens].sort((a, b) => a.sort_order - b.sort_order || a.screen_name.localeCompare(b.screen_name));
  }

  public createScreen(input: Omit<Screen, 'id' | 'created_at' | 'updated_at'>): Screen {
    const existing = this.state.screens.find(
      (s) => s.screen_name.trim().toLowerCase() === input.screen_name.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`Screen with name "${input.screen_name}" already exists.`);
    }

    const newScreen: Screen = {
      ...input,
      id: crypto.randomUUID ? crypto.randomUUID() : `screen_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.screens.push(newScreen);
    this.saveState();
    return newScreen;
  }

  public updateScreen(id: string, updates: Partial<Screen>): Screen {
    const idx = this.state.screens.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Screen not found');

    if (updates.screen_name) {
      const duplicate = this.state.screens.find(
        (s) => s.id !== id && s.screen_name.trim().toLowerCase() === updates.screen_name!.trim().toLowerCase()
      );
      if (duplicate) throw new Error(`Screen name "${updates.screen_name}" already exists.`);
    }

    this.state.screens[idx] = {
      ...this.state.screens[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return { ...this.state.screens[idx] };
  }

  public deleteScreen(id: string): void {
    const hasActiveSession = this.state.sessions.some(
      (s) => s.screen_id === id && s.session_status === 'active'
    );
    if (hasActiveSession) {
      throw new Error('Cannot delete screen while it has an active session. Checkout the session or archive the screen instead.');
    }

    this.state.screens = this.state.screens.filter((s) => s.id !== id);
    this.saveState();
  }

  // ----------------------------------------------------
  // SESSIONS
  // ----------------------------------------------------
  public getActiveSessions(): ActiveSessionView[] {
    const now = Date.now();
    const active = this.state.sessions.filter((s) => s.session_status === 'active');

    return active.map((session) => {
      const screen = this.state.screens.find((s) => s.id === session.screen_id);
      const customer = this.state.customers.find((c) => c.id === session.customer_id);

      const endTime = new Date(session.current_end_at).getTime();
      const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      const is_overdue = endTime <= now;

      // Calculate food orders subtotal
      const sessionOrders = this.state.orders.filter((o) => o.session_id === session.id && o.status === 'confirmed');
      const orderIds = new Set(sessionOrders.map((o) => o.id));
      const ordersTotal = this.state.orderItems
        .filter((oi) => orderIds.has(oi.order_id))
        .reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

      const extensionsCount = this.state.sessionExtensions.filter((e) => e.session_id === session.id).length;
      const hourlyRate = (session.price_snapshot as any)?.hourly_rate || screen?.hourly_rate || 120;

      return {
        id: session.id,
        customer_id: session.customer_id,
        customer_name: customer?.full_name || 'Walk-in Guest',
        customer_phone: customer?.normalized_phone || '--',
        screen_id: session.screen_id,
        screen_name: screen?.screen_name || 'Screen',
        screen_type: screen?.screen_type || 'Gaming',
        start_at: session.start_at,
        original_end_at: session.original_end_at,
        current_end_at: session.current_end_at,
        actual_end_at: session.actual_end_at,
        original_duration_minutes: session.original_duration_minutes,
        session_status: session.session_status,
        player_count: session.player_count,
        hourly_rate: hourlyRate,
        remaining_seconds: remainingSeconds,
        is_overdue,
        orders_total: ordersTotal,
        extensions_count: extensionsCount,
        notes: session.notes,
      };
    });
  }

  public startSession(params: {
    customerName: string;
    phone: string;
    screenId: string;
    durationMinutes: number;
    playerCount?: number;
    notes?: string;
    createdBy?: string;
  }): { session: Session; customer: Customer } {
    if (!params.customerName.trim()) throw new Error('Customer name is required.');
    if (!params.phone.trim()) throw new Error('Customer phone number is required.');
    if (params.durationMinutes <= 0) throw new Error('Duration must be greater than zero.');

    const screen = this.state.screens.find((s) => s.id === params.screenId);
    if (!screen) throw new Error('Selected screen not found.');
    if (!screen.is_active) throw new Error('Selected screen is not active.');
    if (screen.maintenance_status) throw new Error('Screen is currently under maintenance.');

    // Atomic concurrency check
    const existingActive = this.state.sessions.find(
      (s) => s.screen_id === params.screenId && s.session_status === 'active'
    );
    if (existingActive) {
      throw new Error(`Screen "${screen.screen_name}" is already occupied by an active session.`);
    }

    const normalizedPhone = normalizePhoneNumber(params.phone);
    let customer = this.state.customers.find((c) => c.normalized_phone === normalizedPhone);

    if (!customer) {
      customer = {
        id: crypto.randomUUID ? crypto.randomUUID() : `cust_${Date.now()}`,
        full_name: params.customerName.trim(),
        normalized_phone: normalizedPhone,
        email: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.state.customers.push(customer);
    } else {
      customer.full_name = params.customerName.trim();
      customer.updated_at = new Date().toISOString();
    }

    // Determine pricing rule
    const rule = this.state.pricingRules.find(
      (r) => r.is_active && (r.screen_id === screen.id || r.screen_type === screen.screen_type)
    );

    const priceSnapshot = rule
      ? {
          hourly_rate: rule.hourly_rate,
          minimum_duration: rule.minimum_duration,
          billing_interval: rule.billing_interval,
          rounding_rule: rule.rounding_rule,
          minimum_session_charge: rule.minimum_session_charge,
        }
      : {
          hourly_rate: screen.hourly_rate,
          minimum_duration: 30,
          billing_interval: 15,
          rounding_rule: 'ceil',
          minimum_session_charge: 0,
        };

    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + params.durationMinutes * 60 * 1000);

    const newSession: Session = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}`,
      customer_id: customer.id,
      screen_id: screen.id,
      start_at: startAt.toISOString(),
      original_end_at: endAt.toISOString(),
      current_end_at: endAt.toISOString(),
      actual_end_at: null,
      original_duration_minutes: params.durationMinutes,
      session_status: 'active',
      player_count: Math.max(1, params.playerCount || 1),
      price_snapshot: priceSnapshot,
      notes: params.notes || null,
      created_by: params.createdBy || null,
      created_at: startAt.toISOString(),
      updated_at: startAt.toISOString(),
    };

    this.state.sessions.push(newSession);

    this.state.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`,
      admin_id: params.createdBy || null,
      action: 'START_SESSION',
      entity_type: 'sessions',
      entity_id: newSession.id,
      details: {
        screen_name: screen.screen_name,
        duration_minutes: params.durationMinutes,
        customer_name: customer.full_name,
      },
      created_at: startAt.toISOString(),
    });

    this.saveState();
    return { session: newSession, customer };
  }

  public extendSession(params: {
    sessionId: string;
    additionalMinutes: number;
    createdBy?: string;
  }): { session: Session; extension: SessionExtension } {
    if (params.additionalMinutes <= 0) {
      throw new Error('Additional duration must be greater than zero.');
    }

    const session = this.state.sessions.find((s) => s.id === params.sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.session_status !== 'active') throw new Error('Only active sessions can be extended.');

    const currentEndTime = new Date(session.current_end_at).getTime();
    const now = Date.now();
    const baseTime = currentEndTime < now ? now : currentEndTime;
    const newEnd = new Date(baseTime + params.additionalMinutes * 60 * 1000);

    const hourlyRate = (session.price_snapshot as any)?.hourly_rate || 120;
    const additionalCharge = calculateExtensionCharge(params.additionalMinutes, hourlyRate);

    const extension: SessionExtension = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ext_${Date.now()}`,
      session_id: session.id,
      additional_minutes: params.additionalMinutes,
      previous_end_at: session.current_end_at,
      new_end_at: newEnd.toISOString(),
      additional_charge: additionalCharge,
      created_by: params.createdBy || null,
      created_at: new Date().toISOString(),
    };

    this.state.sessionExtensions.push(extension);
    session.current_end_at = newEnd.toISOString();
    session.updated_at = new Date().toISOString();

    this.state.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`,
      admin_id: params.createdBy || null,
      action: 'EXTEND_SESSION',
      entity_type: 'sessions',
      entity_id: session.id,
      details: {
        additional_minutes: params.additionalMinutes,
        previous_end_at: extension.previous_end_at,
        new_end_at: extension.new_end_at,
        additional_charge: additionalCharge,
      },
      created_at: new Date().toISOString(),
    });

    this.saveState();
    return { session, extension };
  }

  public checkoutSession(params: {
    sessionId: string;
    discount?: number;
    notes?: string;
    createdBy?: string;
  }): { session: Session; invoice: Invoice } {
    const session = this.state.sessions.find((s) => s.id === params.sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.session_status !== 'active') throw new Error('Session is not active.');

    const now = new Date();
    session.session_status = 'completed';
    session.actual_end_at = now.toISOString();
    session.updated_at = now.toISOString();

    const pricing = session.price_snapshot as any;
    const billing = calculateGamingBilling(session.start_at, now, pricing);

    // Food and drinks subtotal
    const sessionOrders = this.state.orders.filter((o) => o.session_id === session.id && o.status === 'confirmed');
    const orderIds = new Set(sessionOrders.map((o) => o.id));
    const snacksCharge = this.state.orderItems
      .filter((oi) => orderIds.has(oi.order_id))
      .reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

    const gamingCharge = billing.gamingCharge;
    const discount = Math.max(0, params.discount || 0);
    const subtotal = gamingCharge + snacksCharge;
    const taxRate = this.state.cafeSettings.tax_rate || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const totalAmount = Number((taxableAmount + tax).toFixed(2));

    const invoiceNumber = `INV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice: Invoice = {
      id: crypto.randomUUID ? crypto.randomUUID() : `inv_${Date.now()}`,
      invoice_number: invoiceNumber,
      session_id: session.id,
      customer_id: session.customer_id,
      gaming_amount: gamingCharge,
      snacks_amount: snacksCharge,
      subtotal,
      discount,
      tax,
      total_amount: totalAmount,
      payment_status: 'unpaid',
      notes: params.notes || null,
      created_at: now.toISOString(),
      finalized_at: now.toISOString(),
    };

    this.state.invoices.push(invoice);

    this.state.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`,
      admin_id: params.createdBy || null,
      action: 'CHECKOUT_SESSION',
      entity_type: 'sessions',
      entity_id: session.id,
      details: {
        billable_minutes: billing.billableMinutes,
        gaming_charge: gamingCharge,
        snacks_charge: snacksCharge,
        total_amount: totalAmount,
        invoice_number: invoiceNumber,
      },
      created_at: now.toISOString(),
    });

    this.saveState();
    return { session, invoice };
  }

  // ----------------------------------------------------
  // PRODUCTS & ORDERS
  // ----------------------------------------------------
  public getProducts(): Product[] {
    return [...this.state.products].sort((a, b) => a.product_name.localeCompare(b.product_name));
  }

  public createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const product: Product = {
      ...input,
      id: crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.products.push(product);
    this.saveState();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const idx = this.state.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found.');
    this.state.products[idx] = {
      ...this.state.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return { ...this.state.products[idx] };
  }

  public deleteProduct(id: string): void {
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.saveState();
  }

  public addOrderToSession(params: {
    sessionId: string;
    items: Array<{ productId?: string; productName: string; unitPrice: number; quantity: number }>;
    createdBy?: string;
  }): { order: Order; items: OrderItem[] } {
    const session = this.state.sessions.find((s) => s.id === params.sessionId);
    if (!session) throw new Error('Session not found.');
    if (params.items.length === 0) throw new Error('No items specified in order.');

    for (const item of params.items) {
      if (item.quantity <= 0) throw new Error(`Invalid quantity for ${item.productName}`);
      if (item.unitPrice < 0) throw new Error(`Invalid price for ${item.productName}`);
    }

    const orderId = crypto.randomUUID ? crypto.randomUUID() : `order_${Date.now()}`;
    const order: Order = {
      id: orderId,
      session_id: session.id,
      customer_id: session.customer_id,
      status: 'confirmed',
      created_by: params.createdBy || null,
      created_at: new Date().toISOString(),
    };

    const newItems: OrderItem[] = params.items.map((item) => {
      // Deduct stock if tracked
      if (item.productId) {
        const prod = this.state.products.find((p) => p.id === item.productId);
        if (prod && typeof prod.stock_quantity === 'number') {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        }
      }

      return {
        id: crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}_${Math.random()}`,
        order_id: orderId,
        product_id: item.productId || null,
        product_name_snapshot: item.productName,
        unit_price_snapshot: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
        created_at: new Date().toISOString(),
      };
    });

    this.state.orders.push(order);
    this.state.orderItems.push(...newItems);

    this.state.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`,
      admin_id: params.createdBy || null,
      action: 'ADD_ORDER',
      entity_type: 'orders',
      entity_id: orderId,
      details: {
        session_id: session.id,
        items_count: newItems.length,
        subtotal: newItems.reduce((acc, i) => acc + i.subtotal, 0),
      },
      created_at: new Date().toISOString(),
    });

    this.saveState();
    return { order, items: newItems };
  }

  public getSessionOrders(sessionId: string): Array<{ order: Order; items: OrderItem[] }> {
    const sessionOrders = this.state.orders.filter((o) => o.session_id === sessionId);
    return sessionOrders.map((order) => ({
      order,
      items: this.state.orderItems.filter((oi) => oi.order_id === order.id),
    }));
  }

  // ----------------------------------------------------
  // CUSTOMERS
  // ----------------------------------------------------
  public getCustomers(search?: string): Customer[] {
    let list = [...this.state.customers];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) => c.full_name.toLowerCase().includes(q) || c.normalized_phone.includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getCustomerProfile(id: string) {
    const customer = this.state.customers.find((c) => c.id === id);
    if (!customer) throw new Error('Customer not found.');

    const sessions = this.state.sessions
      .filter((s) => s.customer_id === id)
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

    const invoices = this.state.invoices
      .filter((i) => i.customer_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalSpent = invoices
      .filter((i) => i.payment_status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

    const lastVisit = sessions.length > 0 ? sessions[0].start_at : customer.created_at;

    return {
      customer,
      sessions,
      invoices,
      totalSpent,
      totalSessions: sessions.length,
      lastVisit,
    };
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const idx = this.state.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found.');

    if (updates.normalized_phone) {
      const norm = normalizePhoneNumber(updates.normalized_phone);
      const duplicate = this.state.customers.find((c) => c.id !== id && c.normalized_phone === norm);
      if (duplicate) throw new Error('Another customer is already registered with this phone number.');
      updates.normalized_phone = norm;
    }

    this.state.customers[idx] = {
      ...this.state.customers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return { ...this.state.customers[idx] };
  }

  // ----------------------------------------------------
  // PRICING RULES
  // ----------------------------------------------------
  public getPricingRules(): PricingRule[] {
    return [...this.state.pricingRules];
  }

  public savePricingRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'> & { id?: string }): PricingRule {
    if (rule.id) {
      const idx = this.state.pricingRules.findIndex((r) => r.id === rule.id);
      if (idx !== -1) {
        this.state.pricingRules[idx] = {
          ...this.state.pricingRules[idx],
          ...rule,
          updated_at: new Date().toISOString(),
        };
        this.saveState();
        return { ...this.state.pricingRules[idx] };
      }
    }

    const newRule: PricingRule = {
      ...rule,
      id: crypto.randomUUID ? crypto.randomUUID() : `rule_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.pricingRules.push(newRule);
    this.saveState();
    return newRule;
  }

  public deletePricingRule(id: string): void {
    this.state.pricingRules = this.state.pricingRules.filter((r) => r.id !== id);
    this.saveState();
  }

  // ----------------------------------------------------
  // INVOICES & PAYMENTS
  // ----------------------------------------------------
  public getInvoices(): Array<Invoice & { customer: Customer; screen: Screen | null; payments: Payment[] }> {
    return this.state.invoices
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((inv) => {
        const customer = this.state.customers.find((c) => c.id === inv.customer_id) || {
          id: inv.customer_id,
          full_name: 'Unknown Guest',
          normalized_phone: '--',
          email: null,
          notes: null,
          created_at: inv.created_at,
          updated_at: inv.created_at,
        };

        const session = this.state.sessions.find((s) => s.id === inv.session_id);
        const screen = session ? this.state.screens.find((sc) => sc.id === session.screen_id) || null : null;
        const invoicePayments = this.state.payments.filter((p) => p.invoice_id === inv.id);

        return {
          ...inv,
          customer,
          screen,
          payments: invoicePayments,
        };
      });
  }

  public getInvoiceById(id: string) {
    const inv = this.state.invoices.find((i) => i.id === id);
    if (!inv) return null;

    const customer = this.state.customers.find((c) => c.id === inv.customer_id);
    const session = this.state.sessions.find((s) => s.id === inv.session_id);
    const screen = session ? this.state.screens.find((sc) => sc.id === session.screen_id) : null;
    const invoicePayments = this.state.payments.filter((p) => p.invoice_id === inv.id);
    const orders = session ? this.getSessionOrders(session.id) : [];

    return {
      invoice: inv,
      customer,
      session,
      screen,
      payments: invoicePayments,
      orders,
      cafeSettings: this.state.cafeSettings,
    };
  }

  public recordPayment(params: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['payment_method'];
    paymentReference?: string;
    recordedBy?: string;
  }): { payment: Payment; invoice: Invoice } {
    const invoice = this.state.invoices.find((i) => i.id === params.invoiceId);
    if (!invoice) throw new Error('Invoice not found.');
    if (params.amount <= 0) throw new Error('Payment amount must be greater than zero.');

    const payment: Payment = {
      id: crypto.randomUUID ? crypto.randomUUID() : `pay_${Date.now()}`,
      invoice_id: invoice.id,
      amount: params.amount,
      payment_method: params.paymentMethod,
      payment_reference: params.paymentReference || null,
      recorded_by: params.recordedBy || null,
      created_at: new Date().toISOString(),
    };

    this.state.payments.push(payment);

    const totalPaid = this.state.payments
      .filter((p) => p.invoice_id === invoice.id)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    if (totalPaid >= invoice.total_amount) {
      invoice.payment_status = 'paid';
    } else if (totalPaid > 0) {
      invoice.payment_status = 'partially_paid';
    }

    this.state.auditLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}`,
      admin_id: params.recordedBy || null,
      action: 'RECORD_PAYMENT',
      entity_type: 'payments',
      entity_id: payment.id,
      details: {
        invoice_id: invoice.id,
        amount: params.amount,
        method: params.paymentMethod,
        payment_status: invoice.payment_status,
      },
      created_at: new Date().toISOString(),
    });

    this.saveState();
    return { payment, invoice };
  }

  // ----------------------------------------------------
  // DASHBOARD OVERVIEW & ANALYTICS
  // ----------------------------------------------------
  public getDashboardOverview() {
    const screens = this.getPublicScreens();
    const totalScreens = screens.length;
    const availableScreens = screens.filter((s) => s.status === 'AVAILABLE').length;
    const occupiedScreens = screens.filter((s) => s.status === 'OCCUPIED' || s.status === 'TIME_OVER').length;
    const maintenanceScreens = screens.filter((s) => s.status === 'MAINTENANCE').length;

    const activeSessions = this.state.sessions.filter((s) => s.session_status === 'active');

    // Today's boundaries in local time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayInvoices = this.state.invoices.filter((i) => new Date(i.created_at) >= todayStart);
    const todayPayments = this.state.payments.filter((p) => new Date(p.created_at) >= todayStart);

    // Gaming and snack revenue from today's finalized invoices
    const todayGamingRevenue = todayInvoices.reduce((sum, i) => sum + Number(i.gaming_amount || 0), 0);
    const todaySnackRevenue = todayInvoices.reduce((sum, i) => sum + Number(i.snacks_amount || 0), 0);
    const todayTotalRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayCustomerIds = new Set(
      this.state.sessions.filter((s) => new Date(s.start_at) >= todayStart).map((s) => s.customer_id)
    );

    const recentActivity = this.state.auditLogs.slice(0, 10);

    return {
      totalScreens,
      availableScreens,
      occupiedScreens,
      maintenanceScreens,
      activeSessionsCount: activeSessions.length,
      todayCustomersCount: todayCustomerIds.size,
      todayGamingRevenue,
      todaySnackRevenue,
      todayTotalRevenue,
      recentActivity,
    };
  }

  public getReports(range: 'today' | 'week' | 'month' | 'all' = 'today') {
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(0);
    }

    const filteredInvoices = this.state.invoices.filter((i) => new Date(i.created_at) >= startDate);
    const filteredPayments = this.state.payments.filter((p) => new Date(p.created_at) >= startDate);
    const filteredSessions = this.state.sessions.filter((s) => new Date(s.start_at) >= startDate);

    const gamingRevenue = filteredInvoices.reduce((sum, i) => sum + Number(i.gaming_amount || 0), 0);
    const foodRevenue = filteredInvoices.reduce((sum, i) => sum + Number(i.snacks_amount || 0), 0);
    const actualCollectedRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalBilledRevenue = filteredInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
    const outstandingAmount = Math.max(0, totalBilledRevenue - actualCollectedRevenue);

    const totalSessions = filteredSessions.length;
    const avgDuration =
      totalSessions > 0
        ? Math.round(
            filteredSessions.reduce((sum, s) => sum + (s.original_duration_minutes || 0), 0) / totalSessions
          )
        : 0;

    // Screen usage ranking
    const screenCounts: Record<string, { name: string; count: number; hours: number }> = {};
    for (const session of filteredSessions) {
      const screen = this.state.screens.find((s) => s.id === session.screen_id);
      const name = screen?.screen_name || 'Unknown Screen';
      if (!screenCounts[name]) {
        screenCounts[name] = { name, count: 0, hours: 0 };
      }
      screenCounts[name].count += 1;
      screenCounts[name].hours += (session.original_duration_minutes || 0) / 60;
    }
    const screenRankings = Object.values(screenCounts).sort((a, b) => b.count - a.count);

    // Most popular food items
    const productCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const item of this.state.orderItems) {
      if (new Date(item.created_at) >= startDate) {
        const name = item.product_name_snapshot;
        if (!productCounts[name]) {
          productCounts[name] = { name, quantity: 0, revenue: 0 };
        }
        productCounts[name].quantity += item.quantity;
        productCounts[name].revenue += item.subtotal;
      }
    }
    const productRankings = Object.values(productCounts).sort((a, b) => b.quantity - a.quantity);

    const unpaidInvoices = filteredInvoices.filter((i) => i.payment_status !== 'paid');

    return {
      range,
      gamingRevenue,
      foodRevenue,
      actualCollectedRevenue,
      totalBilledRevenue,
      outstandingAmount,
      totalSessions,
      avgDuration,
      screenRankings,
      productRankings,
      unpaidInvoicesCount: unpaidInvoices.length,
      unpaidInvoices,
    };
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }
}

// Global singleton instance
export const localDb = new LocalDB();

