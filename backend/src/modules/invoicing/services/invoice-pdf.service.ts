/**
 * Invoice PDF Service
 * Generates PDF invoices (placeholder for Puppeteer implementation)
 */

import invoiceService from './invoice.service';
import firmService from '../../legal-crm/services/firm.service';

class InvoicePDFService {
  /**
   * Generate invoice PDF
   * TODO: Implement with Puppeteer for production
   */
  async generatePDF(invoiceId: string): Promise<Buffer> {
    // Get invoice with all details
    const invoice = await invoiceService.getById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const lineItems = await invoiceService.getLineItems(invoiceId);
    const firm = await firmService.getById(invoice.firm_id);

    // For now, return a simple HTML-to-PDF conversion
    // In production, use Puppeteer to render HTML template to PDF
    const html = this.generateInvoiceHTML(invoice, lineItems, firm);

    // Placeholder: Return HTML as buffer
    // TODO: Replace with actual PDF generation using Puppeteer
    return Buffer.from(html, 'utf-8');
  }

  /**
   * Generate invoice HTML (for PDF rendering)
   */
  private generateInvoiceHTML(invoice: any, lineItems: any[], firm: any): string {
    const formatCurrency = (amount: number) => {
      return `R ${amount.toFixed(2)}`;
    };

    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-ZA');
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
    }
    .firm-info h1 {
      margin: 0;
      font-size: 24px;
      color: #1e40af;
    }
    .firm-info p {
      margin: 5px 0;
      color: #6b7280;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      font-size: 28px;
      color: #1e40af;
    }
    .invoice-number {
      font-size: 14px;
      color: #6b7280;
      margin-top: 5px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .party h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .party p {
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background-color: #f3f4f6;
    }
    th {
      text-align: left;
      padding: 12px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals table {
      margin-bottom: 0;
    }
    .totals td {
      border: none;
      padding: 8px 12px;
    }
    .totals .total-row {
      font-weight: bold;
      font-size: 16px;
      background-color: #f3f4f6;
    }
    .notes {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .notes h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      color: #9ca3af;
      font-size: 11px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background-color: #d1fae5;
      color: #065f46;
    }
    .status-overdue {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .status-sent {
      background-color: #dbeafe;
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="firm-info">
      <h1>${firm?.name || 'Law Firm'}</h1>
      <p>${firm?.address || ''}</p>
      <p>${firm?.city ? `${firm.city}, ${firm.province}` : ''}</p>
      <p>${firm?.phone || ''}</p>
      <p>${firm?.email || ''}</p>
      ${firm?.vat_number ? `<p>VAT No: ${firm.vat_number}</p>` : ''}
    </div>
    <div class="invoice-info">
      <h2>INVOICE</h2>
      <div class="invoice-number">${invoice.invoice_number}</div>
      <div class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Bill To</h3>
      <p><strong>${invoice.client_name || 'Client'}</strong></p>
      ${invoice.client_address ? `<p>${invoice.client_address}</p>` : ''}
      ${invoice.client_city ? `<p>${invoice.client_city}, ${invoice.client_state || ''}</p>` : ''}
      ${invoice.billing_email ? `<p>${invoice.billing_email}</p>` : ''}
    </div>
    <div class="party">
      <h3>Invoice Details</h3>
      <p><strong>Issue Date:</strong> ${formatDate(invoice.issue_date)}</p>
      <p><strong>Due Date:</strong> ${formatDate(invoice.due_date)}</p>
      ${invoice.matter_id ? `<p><strong>Matter:</strong> ${invoice.matter_id}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${formatCurrency(parseFloat(item.unit_price))}</td>
          <td class="text-right">${formatCurrency(parseFloat(item.amount))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">${formatCurrency(parseFloat(invoice.subtotal))}</td>
      </tr>
      <tr>
        <td>VAT (${(invoice.vat_rate * 100).toFixed(1)}%):</td>
        <td class="text-right">${formatCurrency(parseFloat(invoice.vat_amount))}</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td class="text-right">${formatCurrency(parseFloat(invoice.total))}</td>
      </tr>
      ${invoice.amount_paid > 0 ? `
        <tr>
          <td>Amount Paid:</td>
          <td class="text-right">${formatCurrency(parseFloat(invoice.amount_paid))}</td>
        </tr>
        <tr class="total-row">
          <td>Balance Due:</td>
          <td class="text-right">${formatCurrency(parseFloat(invoice.balance_due))}</td>
        </tr>
      ` : ''}
    </table>
  </div>

  ${invoice.notes || invoice.terms ? `
    <div class="notes">
      ${invoice.notes ? `
        <div>
          <h3>Notes</h3>
          <p>${invoice.notes}</p>
        </div>
      ` : ''}
      ${invoice.terms ? `
        <div style="margin-top: 20px;">
          <h3>Payment Terms</h3>
          <p>${invoice.terms}</p>
        </div>
      ` : ''}
    </div>
  ` : ''}

  ${firm?.banking_details ? `
    <div class="notes">
      <h3>Banking Details</h3>
      <p>
        Bank: ${firm.banking_details.bank}<br>
        Account: ${firm.banking_details.account}<br>
        Branch: ${firm.banking_details.branch}
      </p>
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business</p>
    <p>This is a computer-generated invoice</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send invoice via email
   * TODO: Implement email sending with PDF attachment
   */
  async sendInvoiceEmail(invoiceId: string, recipientEmail: string): Promise<void> {
    // Placeholder for email sending functionality
    // Will be implemented with nodemailer or similar
    console.log(`Sending invoice ${invoiceId} to ${recipientEmail}`);
    throw new Error('Email sending not yet implemented');
  }
}

export default new InvoicePDFService();
