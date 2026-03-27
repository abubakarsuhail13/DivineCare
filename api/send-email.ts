
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function for sending Emails (Orders, Status Updates, & Newsletter)
 */
export default async function handler(req: Request, res: Response) {
  // 1. Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 2. Body Validation
  const { emailType = 'order', orderId, customerName, customerEmail, productList, totalAmount, adminEmail, resetLink, receiptBase64, receiptName, statusMessage, subject: customSubject } = req.body;
  
  if (emailType !== 'status_update' && emailType !== 'password_change' && emailType !== 'newsletter' && emailType !== 'order' && emailType !== 'password_reset') {
     return res.status(400).json({ success: false, message: 'Invalid email type' });
  }

  if ((emailType === 'order' || emailType === 'newsletter' || emailType === 'status_update') && !customerEmail) {
    return res.status(400).json({ success: false, message: 'Missing email' });
  }

  if ((emailType === 'order' || emailType === 'status_update') && !orderId) {
    return res.status(400).json({ success: false, message: 'Missing order details' });
  }

  // 3. Environment Variable Check
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '465');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.error('[SERVER ERROR] Missing SMTP Credentials in Environment Variables');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  // 4. Configure Transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, 
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 5000,
    socketTimeout: 15000,
  });

  const finalAdminEmail = adminEmail || process.env.ADMIN_EMAIL || user;

  try {
    if (emailType === 'newsletter') {
      const adminMailOptions = {
        from: `"Divine Beauty System" <${user}>`,
        to: finalAdminEmail,
        subject: `New Newsletter Subscriber`,
        text: `Greetings Admin,\n\nA new patron has joined the Divine Circle.\n\nSubscriber Email: ${customerEmail}\n\nProcessed via Divine Beauty Ecommerce.`,
      };

      const userMailOptions = {
        from: `"Divine Beauty" <${user}>`,
        to: customerEmail,
        subject: `Welcome to the Divine Circle`,
        text: `Welcome to Divine Beauty,\n\nThank you for subscribing to our newsletter. You are now part of an exclusive circle that celebrates premium skincare.`,
        html: `
          <div style="font-family: 'Playfair Display', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #FDF2F0; background-color: #FFFDF9;">
            <h1 style="color: #C5A059; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">Welcome to the Divine Circle</h1>
            <p style="font-size: 16px; line-height: 1.6;">Greetings,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #666;">Thank you for subscribing to the <em>Divine Beauty</em> newsletter. You are now part of an exclusive circle that celebrates premium skincare and natural radiance.</p>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #FDF2F0;">
              <p style="font-size: 12px; letter-spacing: 0.1em; color: #C5A059; font-weight: bold;">DIVINE BEAUTY</p>
            </div>
          </div>
        `,
      };

      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
      ]);

      return res.status(200).json({ success: true, message: 'Subscribed successfully' });
      
    } else if (emailType === 'status_update') {
      const userMailOptions = {
        from: `"Divine Beauty" <${user}>`,
        to: customerEmail,
        subject: customSubject || `Order Status Update - #${orderId}`,
        text: `Hello ${customerName},\n\n${statusMessage}\n\nOrder ID: #${orderId}`,
        html: `
          <div style="font-family: 'Playfair Display', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #FDF2F0; background-color: #FFFDF9;">
            <h1 style="color: #C5A059; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">Ritual Update</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #666;">${statusMessage}</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #FDF2F0; border-radius: 4px; text-align: center;">
              <p style="font-size: 13px; margin: 0;"><strong>Order Reference:</strong> #${orderId}</p>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #FDF2F0;">
              <p style="font-size: 12px; letter-spacing: 0.1em; color: #C5A059; font-weight: bold;">THANK YOU FOR CHOOSING DIVINE BEAUTY</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(userMailOptions);
      return res.status(200).json({ success: true, message: 'Status notification dispatched' });

    } else if (emailType === 'password_change') {
      const adminMailOptions = {
        from: `"Divine Beauty Security" <${user}>`,
        to: finalAdminEmail,
        subject: `Security Alert: Admin Password Changed`,
        text: `Greetings Admin,\n\nYour Divine Beauty administrator password was recently changed.`,
        html: `
          <div style="font-family: 'Playfair Display', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #FDF2F0; background-color: #FFFDF9;">
            <h1 style="color: #C5A059; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">Security Alert</h1>
            <p style="font-size: 14px; line-height: 1.6; color: #666;">Your Divine Beauty administrator password was recently updated.</p>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #FDF2F0;">
              <p style="font-size: 12px; letter-spacing: 0.1em; color: #C5A059; font-weight: bold;">DIVINE BEAUTY SECURITY</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
      return res.status(200).json({ success: true, message: 'Password change notification sent' });

    } else if (emailType === 'password_reset') {
      const adminMailOptions = {
        from: `"Divine Beauty Security" <${user}>`,
        to: finalAdminEmail,
        subject: `Password Reset Request`,
        html: `
          <div style="font-family: 'Playfair Display', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #FDF2F0; background-color: #FFFDF9;">
            <h1 style="color: #C5A059; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">Password Reset Request</h1>
            <p style="font-size: 14px; line-height: 1.6; color: #666;">A password reset was requested for your Divine Beauty account.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" style="background-color: #333; color: #fff; padding: 14px 28px; text-decoration: none; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: bold;">Reset Password</a>
            </div>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #FDF2F0;">
              <p style="font-size: 12px; letter-spacing: 0.1em; color: #C5A059; font-weight: bold;">DIVINE BEAUTY SECURITY</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
      return res.status(200).json({ success: true, message: 'Password reset link sent' });

    } else {
      const adminMailOptions = {
        from: `"Divine Beauty System" <${user}>`,
        to: finalAdminEmail,
        subject: `New Divine Order - #${orderId}`,
        attachments: receiptBase64 ? [{ filename: receiptName || 'payment-receipt.png', path: receiptBase64 }] : []
      };

      const userMailOptions = {
        from: `"Divine Beauty" <${user}>`,
        to: customerEmail,
        subject: `Your Divine Beauty Order - #${orderId}`,
        html: `
          <div style="font-family: 'Playfair Display', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #FDF2F0; background-color: #FFFDF9;">
            <h1 style="color: #C5A059; text-align: center; letter-spacing: 0.1em; text-transform: uppercase;">Order Confirmed</h1>
            <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #FDF2F0; border-radius: 4px;">
              <h3 style="margin-top: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: #C5A059;">Order Summary</h3>
              <p style="font-size: 13px; margin: 10px 0;"><strong>Order ID:</strong> #${orderId}</p>
              <p style="font-size: 13px; margin: 10px 0;"><strong>Selection:</strong> ${productList}</p>
              <p style="font-size: 18px; margin: 15px 0 0 0; color: #333; border-top: 1px solid #E5B8A8; padding-top: 10px;"><strong>Total:</strong> ${totalAmount}</p>
            </div>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #FDF2F0;">
              <p style="font-size: 12px; letter-spacing: 0.1em; color: #C5A059; font-weight: bold;">THANK YOU FOR CHOOSING DIVINE BEAUTY</p>
            </div>
          </div>
        `,
      };

      await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
      ]);

      return res.status(200).json({ success: true, message: 'Ritual dispatched' });
    }

  } catch (error) {
    const err = error as Error;
    console.error('[SMTP ERROR] Failed to send email:', err.message);
    
    let errorMessage = err.message;
    if (errorMessage.includes('ECONNREFUSED')) {
      errorMessage = 'Database connection refused. Please ensure DB_HOST, DB_USER, DB_PASS, and DB_NAME are correctly set in the Settings menu.';
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Email service failure', 
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
}
