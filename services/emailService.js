const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(userEmail, userName, order) {
    const subject = `Order Confirmation - Order #${order._id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Thank you for your order, ${userName}!</h2>
        <p>Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Items Ordered</h3>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <p><strong>${item.product.name}</strong></p>
              <p>Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}</p>
            </div>
          `).join('')}
        </div>

        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.name}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.zip}</p>
        </div>

        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for choosing our jewelry store!</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendShippingNotification(userEmail, userName, order, trackingNumber) {
    const subject = `Your Order Has Shipped - Order #${order._id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Great news, ${userName}!</h2>
        <p>Your order has been shipped and is on its way to you.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
        </div>

        <p>You can track your package using the tracking number above.</p>
        <p>Thank you for your business!</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordReset(userEmail, userName, resetToken) {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to Our Jewelry Store!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome, ${userName}!</h2>
        <p>Thank you for joining our jewelry store. We're excited to have you as a customer!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>Browse our collection of beautiful jewelry</li>
            <li>Create your wishlist</li>
            <li>Enjoy exclusive member benefits</li>
          </ul>
        </div>

        <p>Start shopping now and discover our amazing jewelry collection!</p>
        <p>Happy shopping!</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }
}

module.exports = new EmailService();
