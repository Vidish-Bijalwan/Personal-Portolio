import { ManualUpiProvider } from './manual-upi';
import { RazorpayProvider } from './razorpay';
import type { PaymentProvider } from '@/lib/vilish/types';

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENTS_PROVIDER ?? 'manual_upi';
  switch (name) {
    case 'manual_upi':
      return new ManualUpiProvider();
    case 'razorpay':
      return new RazorpayProvider();
    case 'stripe':
      throw new Error('stripe: not implemented');
    default:
      throw new Error(`Unknown payment provider: ${name}`);
  }
}

export { ManualUpiProvider } from './manual-upi';
export { RazorpayProvider } from './razorpay';
