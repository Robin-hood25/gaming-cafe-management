/**
 * Automated Verification Script for Gaming Cafe System
 * Tests core business logic, concurrency checks, pricing calculations,
 * session lifecycle, bill generation, and public privacy sanitization.
 */

import { localDb } from '../src/lib/local-db.js';
import { calculateGamingBilling, calculateExtensionCharge } from '../src/lib/pricing.js';
import { normalizePhoneNumber } from '../src/lib/utils.js';

console.log('====================================================');
console.log('🧪 RUNNING GAMING CAFE INTEGRATION & LOGIC TESTS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

// TEST 1: Phone Normalization
console.log('--- TEST 1: Phone Normalization ---');
assert(normalizePhoneNumber('9845012345') === '+919845012345', 'Normalizes 10 digit Indian number');
assert(normalizePhoneNumber('09845012345') === '+919845012345', 'Normalizes leading zero');
assert(normalizePhoneNumber('+91 98450 12345') === '+919845012345', 'Strips whitespace');

// TEST 2: Pricing Calculations
console.log('\n--- TEST 2: Pricing Calculations ---');
const now = new Date();
const start1 = new Date(now.getTime() - 40 * 60 * 1000); // 40 mins elapsed
const billing1 = calculateGamingBilling(start1, now, {
  hourly_rate: 120,
  minimum_duration: 30,
  billing_interval: 15,
  rounding_rule: 'ceil',
});
// 40 mins rounded up to 15m interval = 45 mins. 45 mins @ 120/hr = 90
assert(billing1.billableMinutes === 45, 'Ceil rounding for 40 mins to 15m interval should be 45 mins');
assert(billing1.gamingCharge === 90, 'Charge for 45 mins @ ₹120/hr should be ₹90');

// Min duration test: 15 mins elapsed with 30 min minimum
const start2 = new Date(now.getTime() - 15 * 60 * 1000);
const billing2 = calculateGamingBilling(start2, now, {
  hourly_rate: 100,
  minimum_duration: 30,
  billing_interval: 15,
  rounding_rule: 'ceil',
});
assert(billing2.billableMinutes === 30, 'Applies minimum 30 minute billing duration');
assert(billing2.gamingCharge === 50, 'Charge for 30 mins @ ₹100/hr should be ₹50');

// Extension charge calculation
const extCharge = calculateExtensionCharge(30, 120);
assert(extCharge === 60, '+30 mins extension at ₹120/hr is ₹60');

// TEST 3: Public Availability Sanitization (Zero Customer Data Leaked)
console.log('\n--- TEST 3: Public Availability Privacy Sanitization ---');
const publicScreens = localDb.getPublicScreens();
assert(publicScreens.length > 0, 'Public screens returned');
for (const screen of publicScreens) {
  assert(!('customer_name' in screen), 'Customer name must NEVER exist in public availability view');
  assert(!('customer_phone' in screen), 'Customer phone must NEVER exist in public availability view');
  assert(!('normalized_phone' in screen), 'Phone number must NEVER exist in public availability view');
  assert(!('invoice_number' in screen), 'Invoice number must NEVER exist in public availability view');
  assert(!('payment_status' in screen), 'Payment status must NEVER exist in public availability view');
  assert('status' in screen, 'Screen status is present');
}

// TEST 4: Atomic Start Session & Concurrency Lock Check
console.log('\n--- TEST 4: Atomic Session Lifecycle & Overlap Prevention ---');
const screens = localDb.getScreens();
const availableScreen = screens.find((s) => s.is_active && !s.maintenance_status && localDb.getActiveSessions().every((act) => act.screen_id !== s.id));
assert(availableScreen !== undefined, 'Found open screen for test');

// Start session
const result1 = localDb.startSession({
  customerName: 'Test Gamer Vikram',
  phone: '9988776655',
  screenId: availableScreen.id,
  durationMinutes: 60,
  playerCount: 1,
  notes: 'Automated test match',
});
assert(result1.session.id !== undefined, 'Session successfully created');
assert(result1.customer.full_name === 'Test Gamer Vikram', 'Customer created/updated');

// Verify immediate double-booking rejection on same screen
let doubleBookingBlocked = false;
try {
  localDb.startSession({
    customerName: 'Conflicting Player',
    phone: '9988776600',
    screenId: availableScreen.id, // SAME SCREEN
    durationMinutes: 60,
  });
} catch (err) {
  doubleBookingBlocked = true;
}
assert(doubleBookingBlocked, 'Prevented concurrent double-booking of occupied screen');

// TEST 5: Extend Session
console.log('\n--- TEST 5: Extend Session ---');
const extRes = localDb.extendSession({
  sessionId: result1.session.id,
  additionalMinutes: 30,
});
assert(extRes.extension.additional_minutes === 30, 'Extension record created with +30m');
assert(new Date(extRes.session.current_end_at) > new Date(extRes.extension.previous_end_at), 'Session end timestamp pushed forward');

// TEST 6: Add F&B Order
console.log('\n--- TEST 6: Food & Beverage Order Attachment ---');
const orderRes = localDb.addOrderToSession({
  sessionId: result1.session.id,
  items: [
    { productName: 'Red Bull Energy Drink (250ml)', unitPrice: 125, quantity: 2 },
    { productName: 'Peri Peri Cheese Maggi', unitPrice: 75, quantity: 1 },
  ],
});
assert(orderRes.items.length === 2, '2 order items created');
const expectedSubtotal = 125 * 2 + 75; // 325
const actualSubtotal = orderRes.items.reduce((s, i) => s + i.subtotal, 0);
assert(actualSubtotal === expectedSubtotal, `Order subtotal is ₹${expectedSubtotal}`);

// TEST 7: Checkout & Bill Generation
console.log('\n--- TEST 7: Checkout & Bill Generation ---');
const checkoutRes = localDb.checkoutSession({
  sessionId: result1.session.id,
  discount: 25,
  notes: 'Automated test checkout',
});
assert(checkoutRes.session.session_status === 'completed', 'Session marked as completed');
assert(checkoutRes.invoice.invoice_number.startsWith('INV-'), 'Unique invoice number generated');
assert(checkoutRes.invoice.snacks_amount === expectedSubtotal, 'Invoice includes snacks total');
assert(checkoutRes.invoice.discount === 25, 'Discount applied');
assert(checkoutRes.invoice.payment_status === 'unpaid', 'Initial payment status is unpaid');

// Screen should now be available again!
const postCheckoutScreens = localDb.getPublicScreens();
const checkedScreen = postCheckoutScreens.find((s) => s.screen_id === availableScreen.id);
assert(checkedScreen.status === 'AVAILABLE', 'Screen is freed and marked AVAILABLE after checkout');

// TEST 8: Record Payment
console.log('\n--- TEST 8: Record Payment ---');
const payRes = localDb.recordPayment({
  invoiceId: checkoutRes.invoice.id,
  amount: checkoutRes.invoice.total_amount,
  paymentMethod: 'UPI',
  paymentReference: 'UPI-TEST-123456',
});
assert(payRes.invoice.payment_status === 'paid', 'Invoice payment status transitioned to PAID');
assert(payRes.payment.payment_method === 'UPI', 'Payment method saved as UPI');

console.log('\n====================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY!`);
console.log('====================================================');

