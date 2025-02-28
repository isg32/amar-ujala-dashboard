import { doc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface PaymentOptions {
  amount: number;
  currency: string;
  userId: string;
  userPhone: string;
  description: string;
  subscriptionId?: string;
}

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createPayment = async (options: PaymentOptions): Promise<void> => {
  const razorpayLoaded = await initializeRazorpay();
  
  if (!razorpayLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }
  
  const paymentData = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: options.amount * 100, // Razorpay expects amount in paise
    currency: options.currency,
    name: 'AmarUjala Newspaper',
    description: options.description,
    handler: async function(response: any) {
      try {
        // Save payment to Firestore
        await addDoc(collection(db, 'payments'), {
          userId: options.userId,
          userPhone: options.userPhone,
          amount: options.amount,
          currency: options.currency,
          paymentId: response.razorpay_payment_id,
          date: new Date(),
          method: 'RazorPay',
          status: 'completed',
          description: options.description
        });
        
        // If this is a subscription payment, update the subscription
        if (options.subscriptionId) {
          const subscriptionRef = doc(db, 'subscriptions', options.subscriptionId);
          await updateDoc(subscriptionRef, {
            lastPaymentDate: new Date(),
            lastPaymentAmount: options.amount
          });
        }
        
        // Send SMS notification (this would be handled by a cloud function in production)
        console.log('Payment successful, SMS notification would be sent here');
        
        alert('Payment successful!');
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Payment was successful, but there was an error updating our records. Please contact support.');
      }
    },
    prefill: {
      contact: options.userPhone
    },
    theme: {
      color: '#3B82F6'
    }
  };
  
  const razorpay = new (window as any).Razorpay(paymentData);
  razorpay.open();
};