import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, recipientEmail, invoiceData } = await request.json();

    if (!invoiceId || !recipientEmail || !invoiceData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Format currency helper
    const formatCurrency = (amount: number, currency: string = 'PHP') => {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    };

    // Format date helper
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Updated responsive HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceData.invoice_number} - REAIV</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f3f4f6;
            }
            
            .email-container {
                max-width: 800px;
                margin: 20px auto;
                background: #ffffff;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            /* Header Section */
            .invoice-header {
                background-color: #475569;
                color: white;
                padding: 40px;
            }
            
            .invoice-badge {
                display: inline-block;
                margin-bottom: 40px;
                border: 2px solid #91cd49;
                color: #91cd49;
                text-align: center;
                padding: 8px 20px;
                border-radius: 4px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-size: 14px;
            }
            
            .logo {
                display: inline-block;
                background-color: #91cd49;
                color: white;
                padding: 16px 32px;
                border-radius: 8px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-bottom: 32px;
            }
            
            .header-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 32px;
            }
            
            .header-item {
                text-align: left;
            }
            
            .header-item:nth-child(even) {
                text-align: right;
            }
            
            .header-label {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                opacity: 0.7;
                margin-bottom: 4px;
            }
            
            .header-value {
                font-size: 16px;
                color: #91cd49;
                font-weight: 600;
            }
            
            /* Amount Due Section */
            .amount-section {
                background-color: #f0fdf4;
                padding: 32px;
                text-align: center;
                border-bottom: 4px solid #91cd49;
            }
            
            .amount-label {
                font-size: 14px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 8px;
            }
            
            .amount-value {
                font-size: 48px;
                color: #475569;
                font-weight: bold;
                margin: 12px 0;
            }
            
            .due-date {
                font-size: 16px;
                color: #6b7280;
                margin-top: 8px;
            }
            
            .pay-button {
                display: inline-block;
                background-color: #91cd49;
                color: white;
                padding: 16px 40px;
                border-radius: 8px;
                text-decoration: none;
                font-size: 18px;
                font-weight: 600;
                margin-top: 20px;
                transition: background-color 0.3s ease;
            }
            
            .pay-button:hover {
                background-color: #7ab33a;
            }
            
            /* Invoice Body */
            .invoice-body {
                padding: 40px;
            }
            
            .section {
                margin-bottom: 40px;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 2px solid #f3f4f6;
            }
            
            /* Billing Information Grid */
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
            }
            
            .info-block h3 {
                font-size: 14px;
                font-weight: 600;
                color: #6b7280;
                margin-bottom: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .info-block p {
                margin: 4px 0;
                line-height: 1.6;
            }
            
            .info-block .highlight {
                color: #91cd49;
                font-weight: 600;
            }
            
            .info-block .italic-note {
                margin-top: 12px;
                font-style: italic;
                color: #6b7280;
                font-size: 14px;
            }
            
            /* Invoice Items Table */
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .items-table th {
                background-color: #475569;
                color: white;
                padding: 16px;
                text-align: left;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .items-table th.text-center {
                text-align: center;
            }
            
            .items-table th.text-right {
                text-align: right;
            }
            
            .items-table td {
                padding: 20px 16px;
                border-bottom: 1px solid #f3f4f6;
                vertical-align: top;
            }
            
            .items-table td.text-center {
                text-align: center;
            }
            
            .items-table td.text-right {
                text-align: right;
            }
            
            .item-description {
                font-weight: 600;
                color: #475569;
                margin-bottom: 4px;
            }
            
            .item-detail {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.5;
            }
            
            .totals-row {
                background-color: #f9fafb;
            }
            
            .totals-row td {
                font-weight: 600;
            }
            
            .grand-total-row {
                background-color: #475569;
                color: white;
                font-size: 18px;
                font-weight: bold;
            }
            
            .grand-total-row td {
                padding: 20px 16px;
                border: none;
            }
            
            /* Payment Information */
            .payment-section {
                background-color: #fef3c7;
                padding: 32px;
                border-radius: 8px;
            }
            
            .payment-title {
                color: #d97706;
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: 600;
            }
            
            .payment-info p {
                margin-bottom: 8px;
            }
            
            .reference-code {
                background-color: #dcfce7;
                padding: 6px 12px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-weight: 600;
                color: #475569;
                display: inline-block;
            }
            
            .bank-details {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                margin-top: 16px;
                border: 1px solid #f59e0b;
            }
            
            .bank-details h4 {
                color: #475569;
                margin-bottom: 16px;
                font-size: 16px;
                font-weight: 600;
            }
            
            .bank-grid {
                display: grid;
                grid-template-columns: 180px 1fr;
                gap: 8px;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .bank-label {
                font-weight: 600;
                color: #6b7280;
            }
            
            .note-box {
                background-color: #dbeafe;
                padding: 20px;
                border-left: 4px solid #3b82f6;
                border-radius: 8px;
                margin-top: 20px;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .note-box strong {
                color: #1e40af;
            }
            
            /* Footer */
            .invoice-footer {
                background-color: #475569;
                color: white;
                padding: 40px;
                text-align: center;
            }
            
            .footer-logo {
                font-size: 36px;
                font-weight: bold;
                color: #91cd49;
                margin-bottom: 12px;
                text-transform: lowercase;
            }
            
            .footer-subtitle {
                font-size: 16px;
                color: #91cd49;
                margin-bottom: 16px;
            }
            
            .footer-tagline {
                font-size: 14px;
                opacity: 0.8;
                letter-spacing: 1px;
            }
            
            .footer-note {
                font-size: 12px;
                opacity: 0.6;
                margin-top: 20px;
            }
            
            /* Responsive Design */
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 0;
                }
                
                .invoice-header,
                .amount-section,
                .invoice-body {
                    padding: 20px;
                }
                
                .header-grid,
                .info-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .header-item:nth-child(even) {
                    text-align: left;
                }
                
                .amount-value {
                    font-size: 36px;
                }
                
                .items-table th,
                .items-table td {
                    padding: 12px 8px;
                    font-size: 14px;
                }
                
                .bank-grid {
                    grid-template-columns: 1fr;
                    gap: 4px;
                }
                
                .pay-button {
                    padding: 12px 24px;
                    font-size: 16px;
                }
            }
            
            @media print {
                body {
                    background: white;
                }
                
                .email-container {
                    box-shadow: none;
                    margin: 0;
                }
                
                .pay-button {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="invoice-header">
                <div class="invoice-badge">INVOICE</div>
                <div class="logo">REAIV</div>
                <div class="header-grid">
                    <div class="header-item">
                        <div class="header-label">Invoice Number</div>
                        <div class="header-value">${invoiceData.invoice_number}</div>
                    </div>
                    <div class="header-item">
                        <div class="header-label">Issue Date</div>
                        <div class="header-value">${formatDate(invoiceData.issue_date)}</div>
                    </div>
                    <div class="header-item">
                        <div class="header-label">Work / Reference</div>
                        <div class="header-value">${invoiceData.work_reference || 'N/A'}</div>
                    </div>
                    <div class="header-item">
                        <div class="header-label">Due Date</div>
                        <div class="header-value">${formatDate(invoiceData.due_date)}</div>
                    </div>
                </div>
            </div>

            <!-- Amount Due Section -->
            <div class="amount-section">
                <div class="amount-label">Amount Due (${invoiceData.currency})</div>
                <div class="amount-value">${formatCurrency(invoiceData.total_amount, invoiceData.currency)}</div>
                <div class="due-date">
                    Due ${formatDate(invoiceData.payment_due_date || invoiceData.due_date)}
                </div>
                <a href="#" class="pay-button">Pay ${formatCurrency(invoiceData.total_amount, invoiceData.currency)}</a>
            </div>

            <!-- Invoice Body -->
            <div class="invoice-body">
                <!-- Billing Information -->
                <div class="section">
                    <div class="info-grid">
                        <div class="info-block">
                            <h3>Billed To</h3>
                            <p><strong>${invoiceData.bill_to_name}</strong></p>
                            ${invoiceData.bill_to_title ? `<p>${invoiceData.bill_to_title}</p>` : ''}
                            ${invoiceData.bill_to_address ? `<p>${invoiceData.bill_to_address}</p>` : ''}
                            ${invoiceData.bill_to_email ? `<p>Email: <span class="highlight">${invoiceData.bill_to_email}</span></p>` : ''}
                            ${invoiceData.bill_to_phone ? `<p>Phone: <span class="highlight">${invoiceData.bill_to_phone}</span></p>` : ''}
                        </div>
                        <div class="info-block">
                            <h3>Service Details</h3>
                            <p><strong>Service Type:</strong> ${invoiceData.service_type}</p>
                            ${invoiceData.projects ? `<p><strong>Projects:</strong> ${invoiceData.projects}</p>` : ''}
                            ${invoiceData.billing_basis ? `<p><strong>Billing Basis:</strong> ${invoiceData.billing_basis}</p>` : ''}
                            ${invoiceData.payment_method ? `<p><strong>Payment Method:</strong> ${invoiceData.payment_method}</p>` : ''}
                            <p><strong>Currency:</strong> ${invoiceData.currency}</p>
                            ${invoiceData.service_notes ? `<p class="italic-note">${invoiceData.service_notes}</p>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Invoice Items -->
                <div class="section">
                    <h2 class="section-title">Invoice Items</h2>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 55%;">Description</th>
                                <th class="text-center">Qty</th>
                                <th class="text-center">Rate</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(invoiceData.items || []).map((item: any) => `
                            <tr>
                                <td>
                                    <div class="item-description">${item.description || 'Service Item'}</div>
                                    ${item.detailed_description ? `<div class="item-detail">${item.detailed_description}</div>` : ''}
                                </td>
                                <td class="text-center">${item.quantity || 1}</td>
                                <td class="text-center">${formatCurrency(item.rate || 0, invoiceData.currency)}</td>
                                <td class="text-right">${formatCurrency(item.amount || 0, invoiceData.currency)}</td>
                            </tr>
                            `).join('')}
                            <tr class="totals-row">
                                <td colspan="3" class="text-right">Subtotal</td>
                                <td class="text-right">${formatCurrency(invoiceData.subtotal, invoiceData.currency)}</td>
                            </tr>
                            <tr class="totals-row">
                                <td colspan="3" class="text-right">Taxes</td>
                                <td class="text-right">${invoiceData.tax_amount > 0 ? formatCurrency(invoiceData.tax_amount, invoiceData.currency) : '—'}</td>
                            </tr>
                            <tr class="grand-total-row">
                                <td colspan="3" class="text-right">Amount Due (${invoiceData.currency})</td>
                                <td class="text-right">${formatCurrency(invoiceData.total_amount, invoiceData.currency)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Payment Information -->
                <div class="section">
                    <h2 class="section-title">Payment Information</h2>
                    <div class="payment-section">
                        <h3 class="payment-title">${invoiceData.payment_method || 'Bank Transfer'}</h3>
                        <p><strong>Payment Due:</strong> ${formatDate(invoiceData.payment_due_date || invoiceData.due_date)}</p>
                        ${invoiceData.payment_reference ? `
                        <p><strong>Reference:</strong> <span class="reference-code">${invoiceData.payment_reference}</span></p>
                        ` : ''}
                        ${(invoiceData.bank_name || invoiceData.account_name || invoiceData.account_number) ? `
                        <div class="bank-details">
                            <h4>Recipient Bank Details</h4>
                            <div class="bank-grid">
                                ${invoiceData.bank_name ? `
                                <span class="bank-label">Bank Name:</span>
                                <span>${invoiceData.bank_name}</span>
                                ` : ''}
                                ${invoiceData.account_name ? `
                                <span class="bank-label">Account Name:</span>
                                <span>${invoiceData.account_name}</span>
                                ` : ''}
                                ${invoiceData.account_number ? `
                                <span class="bank-label">Account Number:</span>
                                <span>${invoiceData.account_number}</span>
                                ` : ''}
                                ${invoiceData.country ? `
                                <span class="bank-label">Country:</span>
                                <span>${invoiceData.country}</span>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="note-box">
                        <strong>Note:</strong> This invoice is issued under the contingency schedule defined in the signed agreement.
                        If the standard milestone schedule applies instead, please advise and a split invoice (USD demo + PHP final)
                        will be issued accordingly.
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
                <div class="footer-logo">reaiv</div>
                <div class="footer-subtitle">REAIV - Reimagine AI Ventures</div>
                <div class="footer-tagline">Think different. Build intelligent. Scale effortlessly.</div>
                <div class="footer-note">This invoice was generated using the REAIV template format.</div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Email options
    const mailOptions = {
      from: {
        name: 'REAIV - Reimagine AI Ventures',
        address: process.env.GMAIL_USER!,
      },
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoice_number} - ${formatCurrency(invoiceData.total_amount, invoiceData.currency)} Due ${formatDate(invoiceData.payment_due_date || invoiceData.due_date)}`,
      html: htmlTemplate,
      text: `
Invoice ${invoiceData.invoice_number}

Amount Due: ${formatCurrency(invoiceData.total_amount, invoiceData.currency)}
Due Date: ${formatDate(invoiceData.payment_due_date || invoiceData.due_date)}

Billed To: ${invoiceData.bill_to_name}
Service Type: ${invoiceData.service_type}

This is an automated email from REAIV. Please view the HTML version for the complete formatted invoice.

Thank you for your business!

REAIV - Reimagine AI Ventures
Think different. Build intelligent. Scale effortlessly.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully!',
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}