-- =====================================================================================
-- GAMING CAFE MANAGEMENT SYSTEM — COMPLETE PRODUCTION SCHEMA
-- =====================================================================================

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Staff and Owners linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CAFE SETTINGS
CREATE TABLE IF NOT EXISTS cafe_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_name TEXT NOT NULL DEFAULT 'Nexus Gaming Lounge',
    tagline TEXT DEFAULT 'Next-Gen Esports & Console Gaming Lounge',
    logo_url TEXT,
    address TEXT NOT NULL DEFAULT '#42 Cyber Hub, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    whatsapp_number TEXT NOT NULL DEFAULT '+919876543210',
    email TEXT DEFAULT 'contact@nexusgaming.in',
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Nexus+Gaming+Lounge+Indiranagar',
    opening_hours TEXT NOT NULL DEFAULT '11:00 AM – 01:00 AM (All 7 Days)',
    currency TEXT NOT NULL DEFAULT '₹',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SCREENS (Gaming Stations / Pods / PCs / Consoles)
CREATE TABLE IF NOT EXISTS screens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_name TEXT NOT NULL UNIQUE,
    screen_type TEXT NOT NULL DEFAULT 'PS5' CHECK (screen_type IN ('PS5', 'PC', 'Xbox Series X', 'Racing Sim', 'VR Pod', 'Other')),
    specs TEXT,
    hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 120.00 CHECK (hourly_rate >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    maintenance_status BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CUSTOMERS (CRM records with unique normalized phone)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    normalized_phone TEXT NOT NULL UNIQUE,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRICING RULES (Configurable rates per screen type or specific screen)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_type TEXT,
    screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
    hourly_rate NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
    minimum_duration INTEGER NOT NULL DEFAULT 30 CHECK (minimum_duration > 0),
    billing_interval INTEGER NOT NULL DEFAULT 15 CHECK (billing_interval > 0),
    rounding_rule TEXT NOT NULL DEFAULT 'ceil' CHECK (rounding_rule IN ('ceil', 'floor', 'round', 'exact')),
    minimum_session_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_target CHECK (
        (screen_type IS NOT NULL AND screen_id IS NULL) OR
        (screen_type IS NULL AND screen_id IS NOT NULL) OR
        (screen_type IS NULL AND screen_id IS NULL)
    )
);

-- 6. SESSIONS (Active and Historical Gaming Sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    screen_id UUID NOT NULL REFERENCES screens(id) ON DELETE RESTRICT,
    start_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    original_end_at TIMESTAMPTZ NOT NULL,
    current_end_at TIMESTAMPTZ NOT NULL,
    actual_end_at TIMESTAMPTZ,
    original_duration_minutes INTEGER NOT NULL CHECK (original_duration_minutes > 0),
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'cancelled')),
    player_count INTEGER NOT NULL DEFAULT 1 CHECK (player_count >= 1),
    price_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SESSION EXTENSIONS (Audit trail of added play time)
CREATE TABLE IF NOT EXISTS session_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    additional_minutes INTEGER NOT NULL CHECK (additional_minutes > 0),
    previous_end_at TIMESTAMPTZ NOT NULL,
    new_end_at TIMESTAMPTZ NOT NULL,
    additional_charge NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (additional_charge >= 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PRODUCTS (Snacks, Drinks, Merch)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cold Drinks', 'Snacks', 'Fast Food', 'Other')),
    selling_price NUMERIC(10,2) NOT NULL CHECK (selling_price >= 0),
    stock_quantity INTEGER DEFAULT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDERS (Food & Drink Orders attached to a gaming session)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(10,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    gaming_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (gaming_amount >= 0),
    snacks_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (snacks_amount >= 0),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finalized_at TIMESTAMPTZ
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Other')),
    payment_reference TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE & INTEGRITY
-- =====================================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_screen_status ON sessions(screen_id, session_status);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_current_end ON sessions(current_end_at);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_invoices_session ON invoices(session_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enforce at most ONE active session per screen at the database level!
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_session_per_screen 
ON sessions (screen_id) 
WHERE (session_status = 'active');

-- =====================================================================================
-- REALTIME REPLICATION CONFIGURATION
-- =====================================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'screens'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE screens;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'session_extensions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE session_extensions;
  END IF;
END $$;

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is authenticated staff or owner
CREATE OR REPLACE FUNCTION is_staff_or_owner() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid() IS NOT NULL) AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_owner() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.uid() IS NOT NULL) AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users can read their own profile; staff can read all profiles; owners can manage
CREATE POLICY "Profiles read by authenticated staff" ON profiles
    FOR SELECT TO authenticated USING (is_staff_or_owner());
CREATE POLICY "Profiles update by owner or self" ON profiles
    FOR UPDATE TO authenticated USING (id = auth.uid() OR is_owner());
CREATE POLICY "Profiles insert by owner" ON profiles
    FOR INSERT TO authenticated WITH CHECK (is_owner() OR NOT EXISTS (SELECT 1 FROM profiles));

-- Cafe Settings: Public can read basic settings; authenticated staff can update
CREATE POLICY "Public read cafe_settings" ON cafe_settings
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff update cafe_settings" ON cafe_settings
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Screens: Public can read active screens (names, types, order); Staff can manage all
CREATE POLICY "Public read active screens" ON screens
    FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Staff full screen access" ON screens
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Customers: Strictly private! Only authenticated staff can read, insert, update
CREATE POLICY "Staff manage customers" ON customers
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Pricing Rules: Staff can view and manage
CREATE POLICY "Staff manage pricing_rules" ON pricing_rules
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Sessions: Private! Only authenticated staff can view and manage sessions
-- Note: Public DOES NOT read sessions table directly to protect customer names/phones!
-- Public reads availability via the sanitized function `get_public_screen_availability()`
CREATE POLICY "Staff manage sessions" ON sessions
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Session Extensions: Only staff
CREATE POLICY "Staff manage session_extensions" ON session_extensions
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Products: Public can read available menu items; Staff can manage all
CREATE POLICY "Public read available products" ON products
    FOR SELECT TO anon, authenticated USING (is_available = true);
CREATE POLICY "Staff manage products" ON products
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Orders & Items: Only staff
CREATE POLICY "Staff manage orders" ON orders
    FOR ALL TO authenticated USING (is_staff_or_owner());
CREATE POLICY "Staff manage order_items" ON order_items
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Invoices & Payments: Strictly private!
CREATE POLICY "Staff manage invoices" ON invoices
    FOR ALL TO authenticated USING (is_staff_or_owner());
CREATE POLICY "Staff manage payments" ON payments
    FOR ALL TO authenticated USING (is_staff_or_owner());

-- Audit logs: Read by owner/staff, insert by system/staff
CREATE POLICY "Staff read audit_logs" ON audit_logs
    FOR SELECT TO authenticated USING (is_staff_or_owner());
CREATE POLICY "Staff insert audit_logs" ON audit_logs
    FOR INSERT TO authenticated WITH CHECK (is_staff_or_owner());

-- =====================================================================================
-- SAFE PUBLIC AVAILABILITY RPC (SANITIZED — ZERO CUSTOMER DATA EXPOSED)
-- =====================================================================================
CREATE OR REPLACE FUNCTION get_public_screen_availability()
RETURNS TABLE (
    screen_id UUID,
    screen_name TEXT,
    screen_type TEXT,
    specs TEXT,
    hourly_rate NUMERIC,
    maintenance_status BOOLEAN,
    is_active BOOLEAN,
    status TEXT,
    current_end_at TIMESTAMPTZ,
    remaining_seconds BIGINT,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS screen_id,
        s.screen_name,
        s.screen_type,
        s.specs,
        s.hourly_rate,
        s.maintenance_status,
        s.is_active,
        CASE
            WHEN s.maintenance_status = true THEN 'MAINTENANCE'
            WHEN s.is_active = false THEN 'INACTIVE'
            WHEN act.id IS NOT NULL AND act.current_end_at <= timezone('utc'::text, now()) THEN 'TIME_OVER'
            WHEN act.id IS NOT NULL THEN 'OCCUPIED'
            ELSE 'AVAILABLE'
        END AS status,
        act.current_end_at,
        CASE
            WHEN act.id IS NOT NULL THEN 
                GREATEST(0::BIGINT, EXTRACT(EPOCH FROM (act.current_end_at - timezone('utc'::text, now())))::BIGINT)
            ELSE 0::BIGINT
        END AS remaining_seconds,
        s.sort_order
    FROM screens s
    LEFT JOIN sessions act ON act.screen_id = s.id AND act.session_status = 'active'
    WHERE s.is_active = true
    ORDER BY s.sort_order ASC, s.screen_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to public anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_screen_availability() TO anon, authenticated;

-- =====================================================================================
-- ATOMIC STORED PROCEDURES / RPCs WITH ROW-LEVEL LOCKING
-- =====================================================================================

-- 1. ATOMIC START SESSION
CREATE OR REPLACE FUNCTION start_session_atomic(
    p_customer_name TEXT,
    p_normalized_phone TEXT,
    p_screen_id UUID,
    p_duration_minutes INTEGER,
    p_player_count INTEGER DEFAULT 1,
    p_notes TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_screen screens%ROWTYPE;
    v_customer_id UUID;
    v_pricing_rule pricing_rules%ROWTYPE;
    v_session_id UUID;
    v_start_at TIMESTAMPTZ := timezone('utc'::text, now());
    v_end_at TIMESTAMPTZ;
    v_hourly_rate NUMERIC(10,2);
    v_snapshot JSONB;
BEGIN
    -- 1. Validate duration
    IF p_duration_minutes <= 0 THEN
        RAISE EXCEPTION 'Session duration must be greater than 0 minutes.';
    END IF;

    -- 2. Lock screen FOR UPDATE to prevent race conditions
    SELECT * INTO v_screen 
    FROM screens 
    WHERE id = p_screen_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Screen not found.';
    END IF;

    IF v_screen.is_active = false THEN
        RAISE EXCEPTION 'This screen is inactive.';
    END IF;

    IF v_screen.maintenance_status = true THEN
        RAISE EXCEPTION 'Screen is currently under maintenance.';
    END IF;

    -- 3. Check for existing active session on this screen
    IF EXISTS (
        SELECT 1 FROM sessions 
        WHERE screen_id = p_screen_id AND session_status = 'active'
    ) THEN
        RAISE EXCEPTION 'This screen is already occupied by an active session.';
    END IF;

    -- 4. Find or Create Customer
    SELECT id INTO v_customer_id 
    FROM customers 
    WHERE normalized_phone = p_normalized_phone;

    IF v_customer_id IS NULL THEN
        INSERT INTO customers (full_name, normalized_phone)
        VALUES (TRIM(p_customer_name), TRIM(p_normalized_phone))
        RETURNING id INTO v_customer_id;
    ELSE
        -- Update name if provided
        UPDATE customers 
        SET full_name = TRIM(p_customer_name), updated_at = now() 
        WHERE id = v_customer_id;
    END IF;

    -- 5. Determine applicable pricing snapshot
    SELECT * INTO v_pricing_rule 
    FROM pricing_rules 
    WHERE is_active = true 
      AND (screen_id = p_screen_id OR screen_type = v_screen.screen_type)
    ORDER BY (screen_id IS NOT NULL) DESC
    LIMIT 1;

    IF FOUND THEN
        v_hourly_rate := v_pricing_rule.hourly_rate;
        v_snapshot := jsonb_build_object(
            'hourly_rate', v_pricing_rule.hourly_rate,
            'minimum_duration', v_pricing_rule.minimum_duration,
            'billing_interval', v_pricing_rule.billing_interval,
            'rounding_rule', v_pricing_rule.rounding_rule,
            'minimum_session_charge', v_pricing_rule.minimum_session_charge
        );
    ELSE
        v_hourly_rate := v_screen.hourly_rate;
        v_snapshot := jsonb_build_object(
            'hourly_rate', v_screen.hourly_rate,
            'minimum_duration', 30,
            'billing_interval', 15,
            'rounding_rule', 'ceil',
            'minimum_session_charge', 0.00
        );
    END IF;

    -- 6. Calculate end timestamp
    v_end_at := v_start_at + (p_duration_minutes * interval '1 minute');

    -- 7. Insert Session
    INSERT INTO sessions (
        customer_id,
        screen_id,
        start_at,
        original_end_at,
        current_end_at,
        original_duration_minutes,
        session_status,
        player_count,
        price_snapshot,
        notes,
        created_by
    ) VALUES (
        v_customer_id,
        p_screen_id,
        v_start_at,
        v_end_at,
        v_end_at,
        p_duration_minutes,
        'active',
        GREATEST(1, p_player_count),
        v_snapshot,
        p_notes,
        p_created_by
    ) RETURNING id INTO v_session_id;

    -- 8. Audit log
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
        p_created_by,
        'START_SESSION',
        'sessions',
        v_session_id::text,
        jsonb_build_object(
            'screen_name', v_screen.screen_name,
            'duration_minutes', p_duration_minutes,
            'customer_name', p_customer_name
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'session_id', v_session_id,
        'customer_id', v_customer_id,
        'screen_name', v_screen.screen_name,
        'current_end_at', v_end_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION start_session_atomic TO authenticated;

-- 2. ATOMIC EXTEND SESSION
CREATE OR REPLACE FUNCTION extend_session_atomic(
    p_session_id UUID,
    p_additional_minutes INTEGER,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_session sessions%ROWTYPE;
    v_previous_end TIMESTAMPTZ;
    v_new_end TIMESTAMPTZ;
    v_hourly_rate NUMERIC(10,2);
    v_additional_charge NUMERIC(10,2);
    v_extension_id UUID;
BEGIN
    IF p_additional_minutes <= 0 THEN
        RAISE EXCEPTION 'Additional minutes must be greater than zero.';
    END IF;

    -- Lock session row
    SELECT * INTO v_session
    FROM sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found.';
    END IF;

    IF v_session.session_status != 'active' THEN
        RAISE EXCEPTION 'Only active sessions can be extended.';
    END IF;

    v_previous_end := v_session.current_end_at;
    -- If current_end_at is in the past, extension starts from now or from current_end_at
    IF v_previous_end < timezone('utc'::text, now()) THEN
        v_new_end := timezone('utc'::text, now()) + (p_additional_minutes * interval '1 minute');
    ELSE
        v_new_end := v_previous_end + (p_additional_minutes * interval '1 minute');
    END IF;

    -- Calculate rate from snapshot
    v_hourly_rate := COALESCE((v_session.price_snapshot->>'hourly_rate')::NUMERIC, 100.00);
    v_additional_charge := ROUND((v_hourly_rate * p_additional_minutes / 60.0), 2);

    -- Insert Extension record
    INSERT INTO session_extensions (
        session_id,
        additional_minutes,
        previous_end_at,
        new_end_at,
        additional_charge,
        created_by
    ) VALUES (
        p_session_id,
        p_additional_minutes,
        v_previous_end,
        v_new_end,
        v_additional_charge,
        p_created_by
    ) RETURNING id INTO v_extension_id;

    -- Update session end
    UPDATE sessions
    SET current_end_at = v_new_end,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_session_id;

    -- Audit log
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
        p_created_by,
        'EXTEND_SESSION',
        'sessions',
        p_session_id::text,
        jsonb_build_object(
            'additional_minutes', p_additional_minutes,
            'previous_end', v_previous_end,
            'new_end', v_new_end,
            'additional_charge', v_additional_charge
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'session_id', p_session_id,
        'new_end_at', v_new_end,
        'additional_charge', v_additional_charge
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION extend_session_atomic TO authenticated;

-- 3. ATOMIC CHECKOUT & BILL GENERATION
CREATE OR REPLACE FUNCTION checkout_session_atomic(
    p_session_id UUID,
    p_discount NUMERIC(10,2) DEFAULT 0.00,
    p_notes TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_session sessions%ROWTYPE;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_actual_minutes NUMERIC;
    v_billable_minutes NUMERIC;
    v_hourly_rate NUMERIC;
    v_min_duration NUMERIC;
    v_interval NUMERIC;
    v_rounding TEXT;
    v_gaming_charge NUMERIC(10,2) := 0.00;
    v_snacks_charge NUMERIC(10,2) := 0.00;
    v_subtotal NUMERIC(10,2) := 0.00;
    v_tax_rate NUMERIC(5,2) := 0.00;
    v_tax_amount NUMERIC(10,2) := 0.00;
    v_total NUMERIC(10,2) := 0.00;
    v_invoice_number TEXT;
    v_invoice_id UUID;
BEGIN
    -- Lock session
    SELECT * INTO v_session
    FROM sessions
    WHERE id = p_session_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found.';
    END IF;

    IF v_session.session_status != 'active' THEN
        RAISE EXCEPTION 'Session is not active.';
    END IF;

    -- Extract pricing rules from snapshot
    v_hourly_rate := COALESCE((v_session.price_snapshot->>'hourly_rate')::NUMERIC, 100.00);
    v_min_duration := COALESCE((v_session.price_snapshot->>'minimum_duration')::NUMERIC, 30.0);
    v_interval := COALESCE((v_session.price_snapshot->>'billing_interval')::NUMERIC, 15.0);
    v_rounding := COALESCE(v_session.price_snapshot->>'rounding_rule', 'ceil');

    -- Calculate actual minutes elapsed
    v_actual_minutes := EXTRACT(EPOCH FROM (v_now - v_session.start_at)) / 60.0;
    IF v_actual_minutes < 1.0 THEN
        v_actual_minutes := 1.0;
    END IF;

    -- Apply minimum duration
    IF v_actual_minutes < v_min_duration THEN
        v_billable_minutes := v_min_duration;
    ELSE
        -- Apply billing interval rounding
        IF v_rounding = 'ceil' THEN
            v_billable_minutes := CEIL(v_actual_minutes / v_interval) * v_interval;
        ELSIF v_rounding = 'floor' THEN
            v_billable_minutes := GREATEST(v_min_duration, FLOOR(v_actual_minutes / v_interval) * v_interval);
        ELSIF v_rounding = 'round' THEN
            v_billable_minutes := GREATEST(v_min_duration, ROUND(v_actual_minutes / v_interval) * v_interval);
        ELSE
            v_billable_minutes := v_actual_minutes;
        END IF;
    END IF;

    -- Gaming charge
    v_gaming_charge := ROUND((v_hourly_rate * v_billable_minutes / 60.0), 2);

    -- Calculate Snacks & Drinks from orders
    SELECT COALESCE(SUM(oi.subtotal), 0.00) INTO v_snacks_charge
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.session_id = p_session_id AND o.status = 'confirmed';

    -- Tax rate from cafe_settings
    SELECT COALESCE(tax_rate, 0.00) INTO v_tax_rate FROM cafe_settings LIMIT 1;

    v_subtotal := v_gaming_charge + v_snacks_charge;
    v_tax_amount := ROUND(((v_subtotal - COALESCE(p_discount, 0.00)) * v_tax_rate / 100.0), 2);
    IF v_tax_amount < 0 THEN v_tax_amount := 0.00; END IF;

    v_total := (v_subtotal - COALESCE(p_discount, 0.00)) + v_tax_amount;
    IF v_total < 0 THEN v_total := 0.00; END IF;

    -- Mark session completed
    UPDATE sessions
    SET session_status = 'completed',
        actual_end_at = v_now,
        updated_at = v_now
    WHERE id = p_session_id;

    -- Generate unique sequential/formatted invoice number: INV-YYYYMMDD-XXXX
    v_invoice_number := 'INV-' || to_char(v_now, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6));

    -- Insert or Update Invoice
    SELECT id INTO v_invoice_id FROM invoices WHERE session_id = p_session_id;

    IF v_invoice_id IS NULL THEN
        INSERT INTO invoices (
            invoice_number,
            session_id,
            customer_id,
            gaming_amount,
            snacks_amount,
            subtotal,
            discount,
            tax,
            total_amount,
            payment_status,
            notes,
            created_at,
            finalized_at
        ) VALUES (
            v_invoice_number,
            p_session_id,
            v_session.customer_id,
            v_gaming_charge,
            v_snacks_charge,
            v_subtotal,
            COALESCE(p_discount, 0.00),
            v_tax_amount,
            v_total,
            'unpaid',
            p_notes,
            v_now,
            v_now
        ) RETURNING id INTO v_invoice_id;
    ELSE
        UPDATE invoices
        SET gaming_amount = v_gaming_charge,
            snacks_amount = v_snacks_charge,
            subtotal = v_subtotal,
            discount = COALESCE(p_discount, 0.00),
            tax = v_tax_amount,
            total_amount = v_total,
            finalized_at = v_now
        WHERE id = v_invoice_id;
    END IF;

    -- Audit log
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
        p_created_by,
        'CHECKOUT_SESSION',
        'sessions',
        p_session_id::text,
        jsonb_build_object(
            'actual_minutes', v_actual_minutes,
            'billable_minutes', v_billable_minutes,
            'gaming_charge', v_gaming_charge,
            'snacks_charge', v_snacks_charge,
            'total_amount', v_total,
            'invoice_id', v_invoice_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'session_id', p_session_id,
        'invoice_id', v_invoice_id,
        'invoice_number', v_invoice_number,
        'billable_minutes', v_billable_minutes,
        'gaming_charge', v_gaming_charge,
        'snacks_charge', v_snacks_charge,
        'subtotal', v_subtotal,
        'discount', COALESCE(p_discount, 0.00),
        'tax', v_tax_amount,
        'total_amount', v_total
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION checkout_session_atomic TO authenticated;

-- 4. ATOMIC RECORD PAYMENT
CREATE OR REPLACE FUNCTION record_payment_atomic(
    p_invoice_id UUID,
    p_amount NUMERIC(10,2),
    p_payment_method TEXT,
    p_payment_reference TEXT DEFAULT NULL,
    p_recorded_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_invoice invoices%ROWTYPE;
    v_payment_id UUID;
    v_total_paid NUMERIC(10,2);
    v_new_status TEXT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    -- Lock invoice
    SELECT * INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found.';
    END IF;

    -- Insert payment
    INSERT INTO payments (
        invoice_id,
        amount,
        payment_method,
        payment_reference,
        recorded_by
    ) VALUES (
        p_invoice_id,
        p_amount,
        p_payment_method,
        p_payment_reference,
        p_recorded_by
    ) RETURNING id INTO v_payment_id;

    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
    FROM payments
    WHERE invoice_id = p_invoice_id;

    IF v_total_paid >= v_invoice.total_amount THEN
        v_new_status := 'paid';
    ELSIF v_total_paid > 0 THEN
        v_new_status := 'partially_paid';
    ELSE
        v_new_status := 'unpaid';
    END IF;

    UPDATE invoices
    SET payment_status = v_new_status
    WHERE id = p_invoice_id;

    -- Audit log
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
    VALUES (
        p_recorded_by,
        'RECORD_PAYMENT',
        'payments',
        v_payment_id::text,
        jsonb_build_object(
            'invoice_id', p_invoice_id,
            'amount', p_amount,
            'method', p_payment_method,
            'payment_status', v_new_status
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', v_payment_id,
        'invoice_id', p_invoice_id,
        'amount_paid', p_amount,
        'total_paid', v_total_paid,
        'payment_status', v_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_payment_atomic TO authenticated;

