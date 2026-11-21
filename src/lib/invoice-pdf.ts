import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Customer, Screen, Session, Payment, CafeSettings, OrderItem } from '@/types/cafe';
import { formatDateTimeIST, formatTimeIST } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';

export interface InvoiceFullData {
  invoice: Invoice;
  customer: Customer | null;
  screen: Screen | null;
  session: Session | null;
  payments: Payment[];
  orders?: Array<{ order: any; items: OrderItem[] }>;
  cafeSettings: CafeSettings;
}

export function generateInvoicePDF(data: InvoiceFullData): jsPDF {
  const { invoice, customer, screen, session, payments, orders, cafeSettings } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor: [number, number, number] = [20, 24, 33]; // #141821 Dark Charcoal
  const accentColor: [number, number, number] = [37, 99, 235]; // #2563eb Electric Blue
  const textDark: [number, number, number] = [17, 24, 39];
  const textMuted: [number, number, number] = [107, 114, 128];

  // ---------------- HEADER BANNER ----------------
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Cafe Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(cafeSettings.cafe_name.toUpperCase(), 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(cafeSettings.tagline || 'Next-Gen Esports & Console Gaming Lounge', 14, 25);
  doc.text(`${cafeSettings.address} | Phone: ${cafeSettings.phone}`, 14, 32);

  // Invoice Number Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageWidth - 14, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(96, 165, 250);
  doc.text(invoice.invoice_number, pageWidth - 14, 26, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(209, 213, 219);
  doc.text(`Date: ${formatDateTimeIST(invoice.created_at)}`, pageWidth - 14, 33, { align: 'right' });

  // ---------------- BILL TO & SESSION DETAILS ----------------
  const boxY = 48;
  const colWidth = (pageWidth - 36) / 2;

  // Box 1: Customer Details
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, boxY, colWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('BILLED TO (CUSTOMER)', 18, boxY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text(customer?.full_name || 'Walk-in Guest', 18, boxY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  doc.text(`Phone: ${customer?.normalized_phone || '--'}`, 18, boxY + 22);
  if (customer?.email) {
    doc.text(`Email: ${customer.email}`, 18, boxY + 28);
  }

  // Box 2: Screen & Session Details
  doc.roundedRect(22 + colWidth, boxY, colWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text('SESSION DETAILS', 26 + colWidth, boxY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text(screen?.screen_name || 'Gaming Station', 26 + colWidth, boxY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textMuted);
  if (session) {
    doc.text(`Start: ${formatTimeIST(session.start_at)} | End: ${formatTimeIST(session.actual_end_at || session.current_end_at)}`, 26 + colWidth, boxY + 22);
    doc.text(`Duration: ${session.original_duration_minutes}m (Booked) | Players: ${session.player_count}`, 26 + colWidth, boxY + 28);
  } else {
    doc.text('Session ID: ' + invoice.session_id.slice(0, 8), 26 + colWidth, boxY + 22);
  }

  // ---------------- ITEMIZED TABLE ----------------
  const tableRows: any[] = [];

  // 1. Gaming Charges Row
  const hourlyRate = (session?.price_snapshot as any)?.hourly_rate || screen?.hourly_rate || 120;
  tableRows.push([
    '1',
    `Gaming Station Access — ${screen?.screen_name || 'Screen'}\nType: ${screen?.screen_type || 'Console'} (Base Rate: ₹${hourlyRate}/hr)`,
    `${session?.original_duration_minutes || 60} mins`,
    `₹${hourlyRate.toFixed(2)}/hr`,
    `₹${Number(invoice.gaming_amount).toFixed(2)}`,
  ]);

  // 2. Snacks & Drink Rows
  let itemIndex = 2;
  if (orders && orders.length > 0) {
    for (const order of orders) {
      for (const item of order.items) {
        tableRows.push([
          String(itemIndex++),
          `Snack/Drink: ${item.product_name_snapshot}`,
          String(item.quantity),
          `₹${Number(item.unit_price_snapshot).toFixed(2)}`,
          `₹${Number(item.subtotal).toFixed(2)}`,
        ]);
      }
    }
  } else if (Number(invoice.snacks_amount) > 0) {
    tableRows.push([
      String(itemIndex++),
      'Food & Beverages (Combined Purchases)',
      '1',
      `₹${Number(invoice.snacks_amount).toFixed(2)}`,
      `₹${Number(invoice.snacks_amount).toFixed(2)}`,
    ]);
  }

  autoTable(doc, {
    startY: 88,
    head: [['#', 'Item & Description', 'Qty / Duration', 'Rate', 'Amount']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // ---------------- PAYMENT SUMMARY & NOTES ----------------
  const summaryX = pageWidth - 90;

  // Payment Status & Method Box on Left
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, finalY, summaryX - 22, 40, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  doc.text('PAYMENT INFORMATION', 18, finalY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);

  const statusLabel = invoice.payment_status.toUpperCase();
  doc.text(`Status: `, 18, finalY + 15);
  if (invoice.payment_status === 'paid') {
    doc.setTextColor(22, 101, 52); // green
    doc.text('PAID IN FULL', 32, finalY + 15);
  } else if (invoice.payment_status === 'partially_paid') {
    doc.setTextColor(180, 83, 9); // amber
    doc.text('PARTIALLY PAID', 32, finalY + 15);
  } else {
    doc.setTextColor(185, 28, 28); // red
    doc.text('UNPAID', 32, finalY + 15);
  }

  doc.setTextColor(...textMuted);
  if (payments && payments.length > 0) {
    const latestPayment = payments[payments.length - 1];
    doc.text(`Method: ${latestPayment.payment_method}`, 18, finalY + 22);
    if (latestPayment.payment_reference) {
      doc.text(`Ref: ${latestPayment.payment_reference}`, 18, finalY + 28);
    }
  } else {
    doc.text('No payment recorded yet.', 18, finalY + 22);
  }

  // Summary Table on Right
  let currentSummaryY = finalY;
  const drawSummaryLine = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 11 : 9);
    doc.setTextColor(...textDark);
    doc.text(label, summaryX, currentSummaryY + 5);
    doc.text(value, pageWidth - 14, currentSummaryY + 5, { align: 'right' });
    currentSummaryY += isBold ? 8 : 6;
  };

  drawSummaryLine('Gaming Charges:', formatCurrency(invoice.gaming_amount));
  if (Number(invoice.snacks_amount) > 0) {
    drawSummaryLine('Food & Beverages:', formatCurrency(invoice.snacks_amount));
  }
  drawSummaryLine('Subtotal:', formatCurrency(invoice.subtotal));

  if (Number(invoice.discount) > 0) {
    drawSummaryLine('Discount:', `-${formatCurrency(invoice.discount)}`);
  }

  if (Number(invoice.tax) > 0) {
    drawSummaryLine(`Tax (${cafeSettings.tax_rate}%):`, formatCurrency(invoice.tax));
  }

  // Divider
  doc.setDrawColor(209, 213, 219);
  doc.line(summaryX, currentSummaryY + 2, pageWidth - 14, currentSummaryY + 2);
  currentSummaryY += 5;

  drawSummaryLine('Grand Total:', formatCurrency(invoice.total_amount), true);

  // Footer notes
  const footerY = 275;
  doc.setDrawColor(229, 231, 235);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for gaming with us! For inquiries or feedback, contact ' + cafeSettings.phone, pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text(`Computer generated invoice • Generated on ${formatDateTimeIST(new Date())}`, pageWidth / 2, footerY + 11, { align: 'center' });

  return doc;
}

export function downloadInvoicePDF(data: InvoiceFullData, filename?: string) {
  const doc = generateInvoicePDF(data);
  const name = filename || `${data.invoice.invoice_number || 'invoice'}.pdf`;
  doc.save(name);
}

export function printInvoicePDF(data: InvoiceFullData) {
  const doc = generateInvoicePDF(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
  };
}

export async function shareInvoiceNative(data: InvoiceFullData) {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      const doc = generateInvoicePDF(data);
      const blob = doc.output('blob');
      const file = new File([blob], `${data.invoice.invoice_number}.pdf`, { type: 'application/pdf' });
      await (navigator as any).share({
        title: `Invoice ${data.invoice.invoice_number}`,
        text: `Gaming session invoice from ${data.cafeSettings.cafe_name} for total ${formatCurrency(data.invoice.total_amount)}`,
        files: [file],
      });
      return true;
    } catch (e) {
      console.warn('Share cancelled or not supported with files, falling back to text share', e);
      try {
        await (navigator as any).share({
          title: `Invoice ${data.invoice.invoice_number}`,
          text: `Invoice #${data.invoice.invoice_number} from ${data.cafeSettings.cafe_name}. Total: ${formatCurrency(data.invoice.total_amount)}`,
        });
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

