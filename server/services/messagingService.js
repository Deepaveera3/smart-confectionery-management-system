/**
 * Customer Communication Architecture Service
 * Provides abstraction layer for Email, SMS, and WhatsApp notifications.
 */

const emailService = require('./emailService');

class MessagingService {
  /**
   * Send Order Confirmation across channels
   */
  static async notifyOrderConfirmed(customerEmail, customerPhone, orderDetails) {
    // 1. Send Email Notification
    if (customerEmail) {
      await emailService.sendOrderConfirmationEmail(customerEmail, orderDetails);
    }

    // 2. Future-Ready SMS Integration Hook (e.g. Twilio / MSG91)
    if (customerPhone) {
      console.log(`📱 [SMS/WhatsApp HOOK] Order #${orderDetails.order_number} confirmed alert queued for ${customerPhone}`);
    }
  }

  /**
   * Send Live Status Change Notification
   */
  static async notifyOrderStatusChanged(customerEmail, customerPhone, orderNumber, newStatus) {
    if (customerEmail) {
      await emailService.sendOrderStatusUpdateEmail(customerEmail, orderNumber, newStatus);
    }

    if (customerPhone) {
      console.log(`📱 [SMS/WhatsApp HOOK] Status update "${newStatus}" for Order #${orderNumber} queued for ${customerPhone}`);
    }
  }

  /**
   * Admin "Call Customer" click action handler helper
   */
  static getDirectCallUrl(phone) {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9+]/g, '');
    return `tel:${cleaned}`;
  }
}

module.exports = MessagingService;
