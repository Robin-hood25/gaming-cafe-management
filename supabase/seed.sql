-- =====================================================================================
-- SEED DATA FOR NEXUS GAMING LOUNGE
-- =====================================================================================

-- 1. Insert Default Cafe Settings (if not already present)
INSERT INTO cafe_settings (
    cafe_name, tagline, address, phone, whatsapp_number, email, google_maps_url, opening_hours, currency, timezone, tax_rate
) VALUES (
    'NEXUS GAMING LOUNGE',
    'Next-Gen Esports & Console Gaming Lounge',
    '#42 Cyber Hub, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
    '+91 98765 43210',
    '+919876543210',
    'hello@nexusgaming.in',
    'https://maps.google.com/?q=Indiranagar+Bengaluru',
    '10:00 AM – 01:00 AM (Monday to Sunday)',
    '₹',
    'Asia/Kolkata',
    5.00
) ON CONFLICT DO NOTHING;

-- 2. Insert Default Screens
INSERT INTO screens (id, screen_name, screen_type, specs, hourly_rate, is_active, maintenance_status, sort_order)
VALUES 
    ('11111111-1111-1111-1111-111111110001', 'SCREEN 01 (PS5 Pro Station Alpha)', 'PS5', 'Sony PlayStation 5 Pro 2TB, 55" LG C3 4K 120Hz OLED, 2x DualSense Edge', 150.00, true, false, 1),
    ('11111111-1111-1111-1111-111111110002', 'SCREEN 02 (PS5 Station Beta)', 'PS5', 'Sony PS5 Disc Edition, 55" Sony Bravia 4K 120Hz, 2x DualSense', 120.00, true, false, 2),
    ('11111111-1111-1111-1111-111111110003', 'SCREEN 03 (RTX 4090 Battlestation 1)', 'PC', 'Core i9-14900K, RTX 4090 24GB, 64GB DDR5, 27" 240Hz 1440p Fast-IPS, Logitech G Pro Wireless', 150.00, true, false, 3),
    ('11111111-1111-1111-1111-111111110004', 'SCREEN 04 (RTX 4080 Battlestation 2)', 'PC', 'Core i7-14700K, RTX 4080 16GB, 32GB DDR5, 27" 240Hz 1440p, SteelSeries Apex Pro', 130.00, true, false, 4),
    ('11111111-1111-1111-1111-111111110005', 'SCREEN 05 (Xbox Series X Lounge)', 'Xbox Series X', 'Xbox Series X 1TB, 65" Samsung QLED 4K 120Hz, 2x Xbox Elite Series 2, Game Pass Ultimate', 110.00, true, false, 5),
    ('11111111-1111-1111-1111-111111110006', 'SCREEN 06 (Fanatec Sim Racing Rig)', 'Racing Sim', 'Fanatec ClubSport DD+ 15Nm, V3 Loadcell Pedals, Triple 32" Curved 165Hz, Sparco Bucket Seat', 250.00, true, false, 6),
    ('11111111-1111-1111-1111-111111110007', 'SCREEN 07 (PS5 Casual Station Gamma)', 'PS5', 'Sony PS5 Digital Edition, 50" 4K HDR, 2x DualSense', 100.00, true, false, 7),
    ('11111111-1111-1111-1111-111111110008', 'SCREEN 08 (PC Esports Rig 3)', 'PC', 'Ryzen 7 7800X3D, RTX 4070 Ti Super, 32GB RAM, 24.5" ZOWIE 360Hz DyAc 2', 110.00, true, false, 8),
    ('11111111-1111-1111-1111-111111110009', 'SCREEN 09 (PC Esports Rig 4)', 'PC', 'Ryzen 7 7800X3D, RTX 4070 Ti Super, 32GB RAM, 24.5" ZOWIE 360Hz DyAc 2', 110.00, true, false, 9),
    ('11111111-1111-1111-1111-111111110010', 'SCREEN 10 (VR Flight & Space Pod)', 'VR Pod', 'Meta Quest 3 + Thrustmaster Warthog HOTAS + Flight Cockpit Platform', 300.00, true, true, 10) -- maintenance demo
ON CONFLICT (screen_name) DO UPDATE SET
    specs = EXCLUDED.specs,
    hourly_rate = EXCLUDED.hourly_rate;

-- 3. Insert Pricing Rules
INSERT INTO pricing_rules (screen_type, hourly_rate, minimum_duration, billing_interval, rounding_rule, minimum_session_charge, is_active)
VALUES
    ('PS5', 120.00, 30, 15, 'ceil', 60.00, true),
    ('PC', 120.00, 30, 15, 'ceil', 60.00, true),
    ('Xbox Series X', 110.00, 30, 15, 'ceil', 55.00, true),
    ('Racing Sim', 250.00, 30, 15, 'ceil', 125.00, true),
    ('VR Pod', 300.00, 15, 15, 'ceil', 150.00, true)
ON CONFLICT DO NOTHING;

-- 4. Insert Menu Products
INSERT INTO products (product_name, category, selling_price, stock_quantity, is_available)
VALUES
    ('Red Bull Energy Drink (250ml)', 'Cold Drinks', 125.00, 48, true),
    ('Monster Energy Original (350ml)', 'Cold Drinks', 120.00, 36, true),
    ('Coca-Cola Chill Can (300ml)', 'Cold Drinks', 40.00, 60, true),
    ('Sprite Zero (300ml Can)', 'Cold Drinks', 40.00, 40, true),
    ('Iced Caramel Cold Coffee', 'Cold Drinks', 95.00, 30, true),
    ('Packaged Mineral Water (1L)', 'Cold Drinks', 20.00, 100, true),
    ('Doritos Sweet Chilli Large', 'Snacks', 50.00, 50, true),
    ('Lay''s Gourmet Cream & Herb', 'Snacks', 40.00, 45, true),
    ('Pringles Sour Cream & Onion', 'Snacks', 110.00, 24, true),
    ('Classic Butter Maggi', 'Fast Food', 50.00, 80, true),
    ('Peri Peri Cheese Maggi', 'Fast Food', 75.00, 70, true),
    ('Crispy French Fries (Salted)', 'Fast Food', 90.00, 40, true),
    ('Cheesy Garlic Breadsticks', 'Fast Food', 120.00, 25, true),
    ('Gaming Mouse Grip Tape', 'Other', 250.00, 15, true)
ON CONFLICT DO NOTHING;

-- 5. Insert Sample Customers
INSERT INTO customers (id, full_name, normalized_phone, email, notes)
VALUES
    ('22222222-2222-2222-2222-222222220001', 'Arjun Sharma', '+919845012345', 'arjun.sharma@example.com', 'Regular FIFA & Tekken player'),
    ('22222222-2222-2222-2222-222222220002', 'Rohan Patel', '+919876098765', 'rohan.p@example.com', 'CS2 & Valorant competitive squad'),
    ('22222222-2222-2222-2222-222222220003', 'Priya Menon', '+919812345678', 'priya.menon@example.com', 'Sim racing enthusiast')
ON CONFLICT (normalized_phone) DO NOTHING;

-- 6. Insert Active Sample Sessions (e.g. Screen 02 and Screen 03)
-- Screen 02: 90 min session, started 30 mins ago, 60 mins remaining
INSERT INTO sessions (
    id, customer_id, screen_id, start_at, original_end_at, current_end_at, 
    original_duration_minutes, session_status, player_count, price_snapshot, notes
)
VALUES (
    '33333333-3333-3333-3333-333333330001',
    '22222222-2222-2222-2222-222222220001',
    '11111111-1111-1111-1111-111111110002',
    timezone('utc'::text, now()) - interval '30 minutes',
    timezone('utc'::text, now()) + interval '60 minutes',
    timezone('utc'::text, now()) + interval '60 minutes',
    90,
    'active',
    2,
    '{"hourly_rate": 120.00, "minimum_duration": 30, "billing_interval": 15, "rounding_rule": "ceil"}'::jsonb,
    'EA Sports FC 24 tournament practice'
) ON CONFLICT DO NOTHING;

-- Screen 03: 120 min session, started 75 mins ago, 45 mins remaining
INSERT INTO sessions (
    id, customer_id, screen_id, start_at, original_end_at, current_end_at, 
    original_duration_minutes, session_status, player_count, price_snapshot, notes
)
VALUES (
    '33333333-3333-3333-3333-333333330002',
    '22222222-2222-2222-2222-222222220002',
    '11111111-1111-1111-1111-111111110003',
    timezone('utc'::text, now()) - interval '75 minutes',
    timezone('utc'::text, now()) + interval '45 minutes',
    timezone('utc'::text, now()) + interval '45 minutes',
    120,
    'active',
    1,
    '{"hourly_rate": 150.00, "minimum_duration": 30, "billing_interval": 15, "rounding_rule": "ceil"}'::jsonb,
    'Valorant Premier League match'
) ON CONFLICT DO NOTHING;

-- Add snacks order to Screen 02 session
INSERT INTO orders (id, session_id, customer_id, status)
VALUES ('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 'confirmed')
ON CONFLICT DO NOTHING;

INSERT INTO order_items (order_id, product_name_snapshot, unit_price_snapshot, quantity, subtotal)
VALUES 
    ('44444444-4444-4444-4444-444444440001', 'Red Bull Energy Drink (250ml)', 125.00, 2, 250.00),
    ('44444444-4444-4444-4444-444444440001', 'Peri Peri Cheese Maggi', 75.00, 1, 75.00)
ON CONFLICT DO NOTHING;

