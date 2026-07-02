const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.isConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder';
  }

  // Create a payment intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.'
      };
    }
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Confirm a payment intent
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a payment method
  async createPaymentMethod(type, card) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type,
        card
      });

      return {
        success: true,
        paymentMethodId: paymentMethod.id,
        paymentMethod
      };
    } catch (error) {
      console.error('Stripe payment method creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a setup intent for saving payment methods
  async createSetupIntent(customerId) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      return {
        success: true,
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      };
    } catch (error) {
      console.error('Stripe setup intent creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get customer's payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      console.error('Stripe get payment methods error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a refund
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        refund
      };
    } catch (error) {
      console.error('Stripe refund creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment intent details
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntent,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        charges: paymentIntent.charges
      };
    } catch (error) {
      console.error('Stripe get payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a webhook endpoint (for production)
  async createWebhookEndpoint(url, events) {
    try {
      const webhook = await this.stripe.webhookEndpoints.create({
        url,
        enabled_events: events,
      });

      return {
        success: true,
        webhookId: webhook.id,
        webhook
      };
    } catch (error) {
      console.error('Stripe webhook creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature, secret) {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return {
        success: true,
        event
      };
    } catch (error) {
      console.error('Stripe webhook verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account balance
  async getAccountBalance() {
    try {
      const balance = await this.stripe.balance.retrieve();
      
      return {
        success: true,
        balance,
        available: balance.available,
        pending: balance.pending
      };
    } catch (error) {
      console.error('Stripe balance retrieval error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a transfer to connected account (for marketplace)
  async createTransfer(amount, destination, metadata = {}) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination,
        metadata
      });

      return {
        success: true,
        transferId: transfer.id,
        transfer
      };
    } catch (error) {
      console.error('Stripe transfer creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StripeService();
