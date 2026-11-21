# NEXUS GAMING LOUNGE — LIVE AVAILABILITY & MANAGEMENT SYSTEM

A production-quality, responsive Gaming Cafe Management System built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

## 🌟 KEY ARCHITECTURE & HIGHLIGHTS

### 1. Public Customer Experience (No Online Booking)
- **Zero Booking / Payment Gates**: Public visitors cannot book or pay online. Sessions are exclusively initiated and managed in-person by staff at the lounge counter.
- **Dynamic Live Screen Availability**: Dynamically calculated from database timestamps (`current_end_at`), never hardcoded.
- **Live Countdown Timers**: Uses actual database session end timestamps; recalculates remaining time every second; refreshing the browser never resets the timer.
- **Overdue Handling**: If a session reaches 00:00:00 but has not yet been checked out by the owner, status changes to `"TIME OVER — AWAITING CHECKOUT"`. It never accidentally marks the screen as available.
- **Strict Privacy**: Zero customer names, phone numbers, bills, or payment data are exposed publicly. Public queries use the safe sanitized RPC function `get_public_screen_availability()`.
- **Supabase Realtime**: Availability immediately updates across all open browsers when owner starts, extends, or checks out a session.

### 2. Private Owner & Staff Dashboard (`/admin/dashboard`)
- **8 Real Metrics**: Total Screens, Available, Occupied, Maintenance, Active Sessions, Today's Gamers, Gaming Revenue, Snack Revenue, Total Collected Revenue.
- **Screen Management**: Add, edit, toggle maintenance, toggle active status, archive screens (with active session protection).
- **New Session Form**: Atomically assigns open screens, captures customer phone and name, calculates end timestamps, snapshots active pricing.
- **Concurrency Protection**: Atomic PostgreSQL procedures with `FOR UPDATE` row locking to prevent two staff members from booking the same screen at the same time.
- **Time Extension**: Add +15m, +30m, +45m, +60m or custom minutes; auto-computes additional charge; keeps complete extension history without rewriting original duration.
- **F&B Order Attachment**: Menu items, drinks, and snacks attached to active customer sessions with price snapshots and quantity validation.
- **One-Click Bill & PDF Invoice**: Itemizes gaming charges, food & beverages, discounts, and taxes. Generates professional printable and downloadable PDF invoices with unique invoice numbers (`INV-YYYYMMDD-XXXX`).
- **Payment Tracking**: Record manual Cash, UPI, and Card payments; updates payment status (`paid`, `partially_paid`, `unpaid`).
- **Customer CRM**: Search by name or normalized phone; view lifetime visit history, sessions, and total spend.
- **Dynamic Pricing**: Configure hourly rates per screen type (PS5, PC, Xbox, Sim Racing, VR Pod), minimum duration, intervals, and rounding rules.
- **Reports & CSV Export**: Realized vs billed revenue, station utilization leaderboard, popular food items, unpaid bills, and CSV export.

---

## 🚀 GETTING STARTED LOCALLY

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Set your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DEFAULT_TIMEZONE=Asia/Kolkata
NEXT_PUBLIC_CURRENCY_SYMBOL=₹
```

> **Note**: If Supabase keys are not set yet, the application automatically runs in **Local Persistent Mode** with initialized seed data and full functionality, allowing immediate local testing without crashing.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public customer website.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the staff portal.

---

## 🗄️ SUPABASE DATABASE SETUP

### 1. Run Schema Migration
Open your **Supabase Project Dashboard &rarr; SQL Editor &rarr; New Query**, copy and run:
`supabase/migrations/20240101000000_init_schema.sql`

This creates:
- Tables: `profiles`, `cafe_settings`, `screens`, `customers`, `sessions`, `session_extensions`, `products`, `orders`, `order_items`, `pricing_rules`, `invoices`, `payments`, `audit_logs`
- Unique indexes (including single active session per screen constraint)
- Realtime publication on `screens`, `sessions`, `session_extensions`
- Strict Row Level Security (RLS) policies
- Atomic RPC procedures: `start_session_atomic`, `extend_session_atomic`, `checkout_session_atomic`, `record_payment_atomic`, and `get_public_screen_availability`

### 2. Run Seed Data
In SQL Editor, run:
`supabase/seed.sql`

This populates default screens (PS5 Pro OLEDs, RTX 4090 Battlestations, Fanatec Sim Rig), pricing rules, and menu products.

### 3. Create the First Owner Account
1. Go to **Authentication &rarr; Users &rarr; Add User** (e.g. `owner@nexusgaming.in`).
2. Run this SQL in the SQL Editor to grant the owner role:
```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('<PASTE_USER_UUID_HERE>', 'Cafe Owner', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';
```

---

## 🧪 AUTOMATED & MANUAL TESTING

### Run Automated System Test
To verify the end-to-end customer-to-checkout workflow:
```bash
node scripts/test-gaming-cafe.mjs
```

### Manual Test Checklist
1. **Public Availability**:
   - Visit `/` and verify screen cards, live countdown, and summary numbers.
   - Inspect page source to confirm NO customer names or phones are exposed.
2. **Owner Login**:
   - Visit `/admin/login`, log in with owner credentials or 1-click demo button.
3. **Start New Session**:
   - Go to `/admin/sessions/new`, pick an open screen, enter customer name & phone, submit.
   - Verify screen status flips to `OCCUPIED` on both the admin dashboard and public homepage immediately.
4. **Extend Session**:
   - Click "Extend Time" on the active session card, choose `+30m`, confirm.
   - Verify public countdown extends immediately.
5. **Add F&B Order**:
   - Click `+ Food/Drinks`, add Red Bull or Maggi, verify subtotal.
6. **Checkout & Invoice**:
   - Click "Checkout", review billable gaming time & snacks total.
   - Click "Finalize & Free Screen", view generated invoice.
   - Click "Download PDF" to verify generated PDF file.
7. **Record Payment**:
   - Click "Record Payment", enter payment method (UPI/Cash), verify invoice status changes to `PAID`.
8. **Verify Availability Release**:
   - Return to `/` and verify the screen is now `AVAILABLE` for the next walk-in player.

---

## 🔒 SECURITY & RLS COMPLIANCE
- `customers`, `sessions`, `orders`, `invoices`, `payments`, and `audit_logs` are protected by Supabase RLS.
- Public anonymous users can only read sanitized data via `get_public_screen_availability()`.
- Phone numbers are normalized and unique.
- Concurrency locks prevent race conditions during session creation.

