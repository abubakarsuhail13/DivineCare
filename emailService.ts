
import { CartItem, Order, OrderStatus } from './types';

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  receiptBase64?: string | null;
  receiptName?: string | null;
}

export async function sendOrderEmails(data: OrderEmailData) {
  const { orderNumber, customerName, customerEmail, items, total, receiptBase64, receiptName } = data;
  
  const productList = items
    .map(item => `${item.quantity} x ${item.name} (Rs. ${(item.price * item.quantity).toLocaleString()})`)
    .join(', ');

  const totalAmount = `Rs. ${total.toLocaleString()}`;

  const payload = {
    emailType: 'order',
    orderId: orderNumber,
    customerName,
    customerEmail,
    productList,
    totalAmount,
    receiptBase64,
    receiptName,
    adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
  };

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      console.log(`%c[ADMIN LOG] Ritual Confirmed: Emails dispatched for Order #${orderNumber}`, 'color: #C5A059; font-weight: bold;');
      return { success: true };
    } catch (error) {
      attempt++;
      console.warn(`[ADMIN LOG] Ritual Ripple: Attempt ${attempt} failed for Order #${orderNumber}. Retrying...`);
      if (attempt >= MAX_RETRIES) {
        console.error(`[ADMIN LOG] Ritual Interrupted: Final failure for Order #${orderNumber}.`, error);
        return { success: false, error };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export async function sendOrderStatusEmail(order: Order, status: OrderStatus) {
  const subject = status === 'Preparing' 
    ? `Your Divine Ritual is Being Prepared - Order #${order.id}`
    : status === 'Delivered'
    ? `Your Divine Ritual Has Arrived - Order #${order.id}`
    : '';
  
  const message = status === 'Preparing'
    ? "Your order has been confirmed and is being prepared. It will be delivered to you soon."
    : status === 'Delivered'
    ? "Your order has been delivered successfully. Thank you for shopping with Divine Beauty."
    : '';

  if (!subject || !message) {
    return { success: true }; // No email for other statuses
  }

  try {
    const payload = {
      emailType: 'status_update',
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      statusMessage: message,
      subject: subject,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    };

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    return { success: true };
  } catch (error) {
    console.error(`[STATUS EMAIL ERROR] Failed to notify ${order.customerEmail} about status ${status}.`, error);
    return { success: false, error };
  }
}

export async function subscribeToNewsletter(email: string) {
  try {
    const payload = {
      emailType: 'newsletter',
      customerEmail: email,
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    };

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    return { success: true };
  } catch (error) {
    console.error(`[NEWSLETTER ERROR] Subscription failed for ${email}.`, error);
    return { success: false, error };
  }
}

export async function sendPasswordChangeEmail(adminEmail: string) {
  try {
    const payload = {
      emailType: 'password_change',
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || adminEmail
    };

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    return { success: true };
  } catch (error) {
    console.error(`[SECURITY ERROR] Password change notification failed.`, error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(adminEmail: string, resetLink: string) {
  try {
    const payload = {
      emailType: 'password_reset',
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || adminEmail,
      resetLink
    };

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    return { success: true };
  } catch (error) {
    console.error(`[SECURITY ERROR] Password reset email failed.`, error);
    return { success: false, error };
  }
}
