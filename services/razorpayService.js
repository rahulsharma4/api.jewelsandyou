const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
let razorpayInstance = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } else {
    console.warn('⚠️ Razorpay keys missing in environment variables');
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

const razorpayService = {
  createOrder: async (amount, currency = 'INR', receipt) => {
    try {
      if (!razorpayInstance) {
        throw new Error('Razorpay is not configured');
      }

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency,
        receipt,
      };

      const order = await razorpayInstance.orders.create(options);
      return { success: true, order };
    } catch (error) {
      console.error('Razorpay create order error:', error);
      return { success: false, error: error.message || 'Failed to create order' };
    }
  },

  verifySignature: (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature === razorpaySignature) {
        return { success: true };
      }
      return { success: false, error: 'Signature verification failed' };
    } catch (error) {
      console.error('Signature verification error:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = razorpayService;
